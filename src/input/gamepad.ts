import type { InputAction, InputAdapter } from "@/src/input/actions"

type GamepadInputOptions = {
  axisThreshold?: number
  gamepads?: () => ArrayLike<Gamepad | null>
}

const buttonActions = new Map<number, InputAction[]>([
  [0, ["interact", "confirm"]],
  [1, ["cancel"]],
  [9, ["pause"]],
  [12, ["moveUp"]],
  [13, ["moveDown"]],
  [14, ["moveLeft"]],
  [15, ["moveRight"]],
])

const setAxisActions = (
  held: Set<InputAction>,
  axes: readonly number[],
  axisThreshold: number,
) => {
  const x = axes[0] ?? 0
  const y = axes[1] ?? 0

  if (x <= -axisThreshold) held.add("moveLeft")
  if (x >= axisThreshold) held.add("moveRight")
  if (y <= -axisThreshold) held.add("moveUp")
  if (y >= axisThreshold) held.add("moveDown")
}

export const createGamepadInputAdapter = (
  options: GamepadInputOptions = {},
): InputAdapter => {
  const axisThreshold = options.axisThreshold ?? 0.5
  const getGamepads =
    options.gamepads ??
    (() =>
      typeof navigator === "undefined" ? [] : (navigator.getGamepads?.() ?? []))

  let held = new Set<InputAction>()
  const queued = new Set<InputAction>()

  const update = () => {
    const nextHeld = new Set<InputAction>()

    for (const gamepad of Array.from(getGamepads())) {
      if (!gamepad) continue
      setAxisActions(nextHeld, gamepad.axes, axisThreshold)

      gamepad.buttons.forEach((button, index) => {
        if (!button?.pressed) return

        for (const action of buttonActions.get(index) ?? []) {
          nextHeld.add(action)
        }
      })
    }

    for (const action of nextHeld) {
      if (!held.has(action)) queued.add(action)
    }

    held = nextHeld
  }

  const getHeldActions = () => Array.from(held)

  const consumePressed = () => {
    const actions = Array.from(queued)
    queued.clear()
    return actions
  }

  const dispose = () => {
    held.clear()
    queued.clear()
  }

  return { consumePressed, dispose, getHeldActions, update }
}
