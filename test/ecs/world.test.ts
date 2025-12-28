import { describe, expect, it } from "vitest"
import { hasComponent } from "bitecs"
import { createGameWorld, spawnPlayer } from "@/src/ecs/world"
import { Position } from "@/src/ecs/components"

describe("ecs world", () => {
  it("spawns a player entity with position", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 12, y: 34 })

    expect(hasComponent(world, Position, player)).toBe(true)
    expect(Position.x[player]).toBe(12)
    expect(Position.y[player]).toBe(34)
  })
})
