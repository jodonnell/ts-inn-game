import { describe, expect, it, vi } from "vitest"
import { createLoop } from "@/src/ecs/systems/loop"
import { createGameWorld } from "@/src/ecs/world"

describe("ecs loop", () => {
  it("computes dt in seconds and calls systems in order", () => {
    const world = createGameWorld()
    const calls: Array<{ label: string; dt: number }> = []
    const a = vi.fn((_: unknown, dt: number) => calls.push({ label: "a", dt }))
    const b = vi.fn((_: unknown, dt: number) => calls.push({ label: "b", dt }))

    const loop = createLoop({ world, systems: [a, b] })
    loop.step(1000)
    loop.step(1500)

    expect(calls).toEqual([
      { label: "a", dt: 0 },
      { label: "b", dt: 0 },
      { label: "a", dt: 0.5 },
      { label: "b", dt: 0.5 },
    ])
  })

  it("can schedule frames without requestAnimationFrame", () => {
    const world = createGameWorld()
    const system = vi.fn()
    let nextTick: ((time: number) => void) | undefined
    const scheduleFrame = vi.fn((cb: (time: number) => void) => {
      nextTick = cb
      return 1
    })
    const cancelScheduledFrame = vi.fn()

    const loop = createLoop({
      world,
      systems: [system],
      scheduleFrame,
      cancelScheduledFrame,
    })

    loop.start()
    nextTick?.(1000)
    loop.stop()

    expect(scheduleFrame).toHaveBeenCalledTimes(2)
    expect(cancelScheduledFrame).toHaveBeenCalledWith(1)
    expect(system).toHaveBeenCalledWith(world, 0)
  })

  it("uses a fixed dt when configured", () => {
    const world = createGameWorld()
    const calls: number[] = []
    const system = vi.fn((_: unknown, dt: number) => calls.push(dt))

    const loop = createLoop({
      world,
      systems: [system],
      fixedDtSeconds: 1 / 120,
    })

    loop.step(1000)
    loop.step(5000)

    expect(calls).toEqual([1 / 120, 1 / 120])
  })
})
