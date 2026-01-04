import managerSheetData from "@/assets/spritesheets/manager-sheet.json"

export type ManagerDirection = "front" | "back" | "left" | "right"
export type ManagerAction = "idle" | "walk"
export type ManagerAnimationState = {
  action: ManagerAction
  direction: ManagerDirection
}

type Velocity = { x: number; y: number }

const buildManagerAnimationFrames = (): Record<string, string[]> => {
  const frames = (managerSheetData as { frames: Record<string, unknown> })
    .frames
  const grouped = new Map<string, Array<{ index: number; frame: string }>>()

  for (const frame of Object.keys(frames)) {
    const match = frame.match(
      /_(front|back|left|right)(idle|walk|interact)_(\d{4})\.png$/,
    )
    if (!match) continue
    const [, direction, action, indexText] = match
    const key = `${action}-${direction}`
    const index = Number(indexText)
    const entries = grouped.get(key) ?? []
    entries.push({ index, frame })
    grouped.set(key, entries)
  }

  const resolved: Record<string, string[]> = {}
  for (const [key, entries] of grouped) {
    resolved[key] = entries
      .slice()
      .sort((a, b) => a.index - b.index)
      .map((entry) => entry.frame)
  }

  return resolved
}

const MANAGER_ANIMATION_FRAMES = buildManagerAnimationFrames()

export const selectManagerAnimationState = (
  velocity: Velocity,
  lastDirection: ManagerDirection,
): ManagerAnimationState => {
  const { x, y } = velocity
  if (x === 0 && y === 0) {
    return { action: "idle", direction: lastDirection }
  }

  if (Math.abs(x) >= Math.abs(y)) {
    return { action: "walk", direction: x >= 0 ? "right" : "left" }
  }

  return { action: "walk", direction: y >= 0 ? "front" : "back" }
}

export const getManagerAnimationFrames = (
  state: ManagerAnimationState,
): string[] => {
  const key = `${state.action}-${state.direction}`
  const frames = MANAGER_ANIMATION_FRAMES[key]
  if (!frames) {
    throw new Error(`Missing manager animation frames: ${key}`)
  }
  return frames
}
