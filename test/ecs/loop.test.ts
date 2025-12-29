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
})
