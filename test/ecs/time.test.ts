import { describe, expect, it } from "vitest"
import { createGameWorld } from "@/src/ecs/world"
import { createGameTimeState, createTimeSystem } from "@/src/ecs/systems/time"

describe("ecs time system", () => {
  it("advances game minutes based on real minutes per day", () => {
    const world = createGameWorld()
    const state = createGameTimeState(0)
    const system = createTimeSystem(state, { realMinutesPerDay: 15 })

    system(world, 60)

    expect(state.minutes).toBeCloseTo(96)
  })

  it("wraps time at 24 hours", () => {
    const world = createGameWorld()
    const state = createGameTimeState(1430)
    const system = createTimeSystem(state, { realMinutesPerDay: 24 })

    system(world, 20)

    expect(state.minutes).toBeCloseTo(10)
  })

  it("increments days passed when time wraps", () => {
    const world = createGameWorld()
    const state = createGameTimeState(1430)
    const system = createTimeSystem(state, { realMinutesPerDay: 24 })

    system(world, 20)

    expect((state as { daysPassed: number }).daysPassed).toBe(1)
  })
})
