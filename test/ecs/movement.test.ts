import { describe, expect, it } from "vitest"
import { createGameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import { Position, Velocity } from "@/src/ecs/components"
import {
  createInputSystem,
  createMovementSystem,
  type InputState,
} from "@/src/ecs/systems/movement"

describe("movement systems", () => {
  it("writes normalized velocity from input", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })

    const input: InputState = {
      getMovement: () => ({ x: 1, y: 1 }),
    }

    const system = createInputSystem(player, input, 10)
    system(world, 0)

    const expected = 10 / Math.sqrt(2)
    expect(Velocity.x[player]).toBeCloseTo(expected)
    expect(Velocity.y[player]).toBeCloseTo(expected)
  })

  it("updates position based on velocity and dt", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })

    Velocity.x[player] = 10
    Velocity.y[player] = -20

    const system = createMovementSystem(player)
    system(world, 0.5)

    expect(Position.x[player]).toBeCloseTo(5)
    expect(Position.y[player]).toBeCloseTo(-10)
  })

  it("prevents movement into collision walls", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })

    Velocity.x[player] = 20
    Velocity.y[player] = 0

    const walls = [
      { x: 5, y: -5, width: 10, height: 10 },
      { x: -15, y: 8, width: 30, height: 6 },
    ]

    const system = createMovementSystem(player, walls)
    system(world, 0.5)

    expect(Position.x[player]).toBe(0)
    expect(Position.y[player]).toBe(0)
  })
})
