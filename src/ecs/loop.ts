import type { GameWorld } from "@/src/ecs/world"

export type System = (world: GameWorld, dt: number) => void

type LoopOptions = {
  world: GameWorld
  systems: System[]
  now?: () => number
  requestFrame?: (cb: (time: number) => void) => number
  cancelFrame?: (id: number) => void
}

export const createLoop = ({
  world,
  systems,
  now = () => performance.now(),
  requestFrame = (cb) => requestAnimationFrame(cb),
  cancelFrame = (id) => cancelAnimationFrame(id),
}: LoopOptions) => {
  let lastTimeMs: number | undefined
  let rafId: number | undefined

  const runSystems = (dt: number) => {
    for (const system of systems) system(world, dt)
  }

  const step = (timeMs = now()) => {
    const dt = lastTimeMs === undefined ? 0 : (timeMs - lastTimeMs) / 1000
    lastTimeMs = timeMs
    runSystems(dt)
  }

  const tick = (timeMs: number) => {
    step(timeMs)
    rafId = requestFrame(tick)
  }

  const start = () => {
    if (rafId !== undefined) return
    lastTimeMs = undefined
    rafId = requestFrame(tick)
  }

  const stop = () => {
    if (rafId === undefined) return
    cancelFrame(rafId)
    rafId = undefined
  }

  return { start, stop, step }
}
