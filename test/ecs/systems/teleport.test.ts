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
        {
          x: 10,
          y: 10,
          width: 20,
          height: 20,
          targetMapKey: "room1",
          spawnId: "pointA",
        },
      ],
    }
    const input = { consume: vi.fn(() => false) }
    const teleportTo = vi.fn()
    const system = createTeleportSystem(player, teleportState, input, teleportTo)

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
    expect(teleportTo).toHaveBeenCalledWith("room1", "pointA")
  })

  it("waits for interact inside an interaction-required teleport zone", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const teleportState = {
      zones: [
        {
          x: 10,
          y: 10,
          width: 20,
          height: 20,
          targetMapKey: "room1",
          spawnId: "pointA",
          interactionRequired: true,
        },
      ],
    }
    const input = { consume: vi.fn(() => false) }
    const teleportTo = vi.fn()
    const system = createTeleportSystem(player, teleportState, input, teleportTo)

    Position.x[player] = 15
    Position.y[player] = 15
    system(world, 0.016)

    expect(teleportTo).not.toHaveBeenCalled()

    input.consume.mockReturnValueOnce(true)
    system(world, 0.016)

    expect(input.consume).toHaveBeenCalledWith("interact")
    expect(teleportTo).toHaveBeenCalledTimes(1)
    expect(teleportTo).toHaveBeenCalledWith("room1", "pointA")
  })

  it("teleports when interacting within door range of an interaction-required zone", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const teleportState = {
      zones: [
        {
          x: 224,
          y: 192,
          width: 32,
          height: 32,
          targetMapKey: "room1",
          spawnId: "pointA",
          interactionRequired: true,
        },
      ],
    }
    const input = { consume: vi.fn(() => true) }
    const teleportTo = vi.fn()
    const system = createTeleportSystem(player, teleportState, input, teleportTo)

    Position.x[player] = 240
    Position.y[player] = 240
    system(world, 0.016)

    expect(teleportTo).toHaveBeenCalledTimes(1)
    expect(teleportTo).toHaveBeenCalledWith("room1", "pointA")
  })

  it("teleports when interacting from the hallway standing row below a door", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const teleportState = {
      zones: [
        {
          x: 224,
          y: 192,
          width: 32,
          height: 32,
          targetMapKey: "room1",
          spawnId: "pointA",
          interactionRequired: true,
        },
      ],
    }
    const input = { consume: vi.fn(() => true) }
    const teleportTo = vi.fn()
    const system = createTeleportSystem(player, teleportState, input, teleportTo)

    Position.x[player] = 224
    Position.y[player] = 256
    system(world, 0.016)

    expect(teleportTo).toHaveBeenCalledTimes(1)
    expect(teleportTo).toHaveBeenCalledWith("room1", "pointA")
  })
})
