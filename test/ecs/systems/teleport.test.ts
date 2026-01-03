import { describe, expect, it, vi } from "vitest"
import { createTeleportSystem } from "@/src/ecs/systems/teleport"
import { createGameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import { Position } from "@/src/ecs/components"

describe("teleport system", () => {
  it("teleports when entering a teleport zone", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const teleportState = {
      zones: [
        { x: 10, y: 10, width: 20, height: 20, targetMapKey: "room1" },
      ],
    }
    const teleportTo = vi.fn()
    const system = createTeleportSystem(player, teleportState, teleportTo)

    Position.x[player] = 5
    Position.y[player] = 5
    system(world, 0.016)

    Position.x[player] = 15
    Position.y[player] = 15
    system(world, 0.016)
    system(world, 0.016)

    Position.x[player] = 50
    Position.y[player] = 50
    system(world, 0.016)

    Position.x[player] = 15
    Position.y[player] = 15
    system(world, 0.016)

    expect(teleportTo).toHaveBeenCalledTimes(2)
    expect(teleportTo).toHaveBeenCalledWith("room1")
  })
})
