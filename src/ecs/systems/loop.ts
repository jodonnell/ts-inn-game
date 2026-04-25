import type { GameWorld } from "@/src/ecs/world"

export type System = (world: GameWorld, dt: number) => void
export type SimulationSystem = System
export type RenderSystem = System

type LoopOptions = {
  world: GameWorld
  simulationSystems: SimulationSystem[]
  renderSystems?: RenderSystem[]
  simulationDtSeconds?: number
  now?: () => number
  scheduleFrame?: (cb: (time: number) => void) => number
  cancelScheduledFrame?: (id: number) => void
}

export const createLoop = ({
  world,
  simulationSystems,
  renderSystems = [],
  simulationDtSeconds = 1 / 60,
  now = () => performance.now(),
  scheduleFrame = (cb) => requestAnimationFrame(cb),
  cancelScheduledFrame = (id) => cancelAnimationFrame(id),
}: LoopOptions) => {
  let lastTimeMs: number | undefined
  let rafId: number | undefined
  let accumulatorSeconds = 0

  const runSystems = (systems: System[], dt: number) => {
    for (const system of systems) system(world, dt)
  }

  const step = (timeMs = now()) => {
    const frameDtSeconds =
      lastTimeMs === undefined ? 0 : (timeMs - lastTimeMs) / 1000
    lastTimeMs = timeMs
    accumulatorSeconds += frameDtSeconds

    while (accumulatorSeconds >= simulationDtSeconds) {
      runSystems(simulationSystems, simulationDtSeconds)
      accumulatorSeconds -= simulationDtSeconds
    }

    runSystems(renderSystems, frameDtSeconds)
  }

  const tick = (timeMs: number) => {
    step(timeMs)
    rafId = scheduleFrame(tick)
  }

  const start = () => {
    if (rafId !== undefined) return
    lastTimeMs = undefined
    accumulatorSeconds = 0
    rafId = scheduleFrame(tick)
  }

  const stop = () => {
    if (rafId === undefined) return
    cancelScheduledFrame(rafId)
    rafId = undefined
  }

  return { start, stop, step }
}
