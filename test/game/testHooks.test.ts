import { describe, expect, it, vi } from "vitest"
import { createGameTestApi, installGameTestApi } from "@/src/game/testHooks"
import { createGameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import { Position } from "@/src/ecs/components"
import { createRoomState } from "@/src/game/roomState"

describe("game test hooks", () => {
  it("sets the player position", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const roomState = createRoomState()
    const roomLoader = vi.fn(() => true)
    const api = createGameTestApi({ player, roomState, roomLoader })

    api.setPlayerPosition(120, 80)

    expect(Position.x[player]).toBe(120)
    expect(Position.y[player]).toBe(80)
  })

  it("teleports via the room loader", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const roomState = createRoomState()
    const roomLoader = vi.fn(() => true)
    const api = createGameTestApi({ player, roomState, roomLoader })

    const result = api.teleportTo("room1", "pointA")

    expect(result).toBe(true)
    expect(roomLoader).toHaveBeenCalledWith("room1", "pointA")
  })

  it("moves the player to the interaction point", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const roomState = createRoomState()
    roomState.replaceInteractionPoint({
      x: 200,
      y: 160,
      radius: 12,
      offsetY: 16,
      bounds: { x: 190, y: 150, width: 20, height: 20 },
    })
    const roomLoader = vi.fn(() => true)
    const api = createGameTestApi({ player, roomState, roomLoader })

    api.movePlayerToInteraction()

    expect(Position.x[player]).toBe(200)
    expect(Position.y[player]).toBe(160)
  })

  it("installs the test api on the provided target", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const roomState = createRoomState()
    const roomLoader = vi.fn(() => true)
    const target: { __gameTestApi?: unknown } = {}

    installGameTestApi({ player, roomState, roomLoader }, target)

    expect(target.__gameTestApi).toEqual(
      expect.objectContaining({
        setPlayerPosition: expect.any(Function),
        teleportTo: expect.any(Function),
        movePlayerToInteraction: expect.any(Function),
      }),
    )
  })
})
