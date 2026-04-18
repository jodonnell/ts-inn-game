import type { GameWorld } from "@/src/ecs/world"

export type System = (world: GameWorld, dt: number) => void

type LoopOptions = {
  world: GameWorld
  systems: System[]
  fixedDtSeconds?: number
  now?: () => number
  scheduleFrame?: (cb: (time: number) => void) => number
  cancelScheduledFrame?: (id: number) => void
}

export const createLoop = ({
  world,
  systems,
  fixedDtSeconds,
  now = () => performance.now(),
  scheduleFrame = (cb) => requestAnimationFrame(cb),
  cancelScheduledFrame = (id) => cancelAnimationFrame(id),
}: LoopOptions) => {
  let lastTimeMs: number | undefined
  let rafId: number | undefined

  const runSystems = (dt: number) => {
    for (const system of systems) system(world, dt)
  }

  const step = (timeMs = now()) => {
    const dt =
      fixedDtSeconds ?? (lastTimeMs === undefined ? 0 : (timeMs - lastTimeMs) / 1000)
    lastTimeMs = timeMs
    runSystems(dt)
  }

  const tick = (timeMs: number) => {
    step(timeMs)
    rafId = scheduleFrame(tick)
  }

  const start = () => {
    if (rafId !== undefined) return
    lastTimeMs = undefined
    rafId = scheduleFrame(tick)
  }

  const stop = () => {
    if (rafId === undefined) return
    cancelScheduledFrame(rafId)
    rafId = undefined
  }

  return { start, stop, step }
}
