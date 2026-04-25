import { describe, expect, it, vi } from "vitest"
import { createLoop } from "@/src/ecs/systems/loop"
import { createGameWorld } from "@/src/ecs/world"

describe("ecs loop", () => {
  it("runs fixed simulation ticks and renders separately once per frame", () => {
    const world = createGameWorld()
    const simulationCalls: number[] = []
    const renderCalls: number[] = []
    const simulationSystem = vi.fn((_: unknown, dt: number) =>
      simulationCalls.push(dt),
    )
    const renderSystem = vi.fn((_: unknown, dt: number) => renderCalls.push(dt))

    const loop = createLoop({
      world,
      simulationSystems: [simulationSystem],
      renderSystems: [renderSystem],
      simulationDtSeconds: 0.25,
    })
    loop.step(1000)
    loop.step(1500)

    expect(simulationCalls).toEqual([0.25, 0.25])
    expect(renderCalls).toEqual([0, 0.5])
  })

  it("can schedule frames without requestAnimationFrame", () => {
    const world = createGameWorld()
    const system = vi.fn()
    const renderSystem = vi.fn()
    let nextTick: ((time: number) => void) | undefined
    const scheduleFrame = vi.fn((cb: (time: number) => void) => {
      nextTick = cb
      return 1
    })
    const cancelScheduledFrame = vi.fn()

    const loop = createLoop({
      world,
      simulationSystems: [system],
      renderSystems: [renderSystem],
      scheduleFrame,
      cancelScheduledFrame,
    })

    loop.start()
    nextTick?.(1000)
    loop.stop()

    expect(scheduleFrame).toHaveBeenCalledTimes(2)
    expect(cancelScheduledFrame).toHaveBeenCalledWith(1)
    expect(system).not.toHaveBeenCalled()
    expect(renderSystem).toHaveBeenCalledWith(world, 0)
  })

  it("uses a fixed dt when configured", () => {
    const world = createGameWorld()
    const calls: number[] = []
    const system = vi.fn((_: unknown, dt: number) => calls.push(dt))

    const loop = createLoop({
      world,
      simulationSystems: [system],
      simulationDtSeconds: 1 / 120,
    })

    loop.step(1000)
    loop.step(5000)

    expect(calls).toEqual(new Array(480).fill(1 / 120))
  })
})
