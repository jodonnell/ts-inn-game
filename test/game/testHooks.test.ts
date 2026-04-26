import { describe, expect, it, vi } from "vitest"
import { createGameTestApi, installGameTestApi } from "@/src/game/testHooks"
import { createGameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import { Position } from "@/src/ecs/components"
import { createRoomState } from "@/src/game/roomState"
import { createConversationState } from "@/src/game/conversation"

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

  it("moves the player to a fixture interaction point", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const roomState = createRoomState()
    roomState.replaceFixtures([
      {
        id: "bed-1",
        type: "bed",
        x: 320,
        y: 160,
        width: 160,
        height: 160,
        durationMs: 4000,
        state: "dirty",
        progressMs: 0,
      },
    ])
    const roomLoader = vi.fn(() => true)
    const api = createGameTestApi({ player, roomState, roomLoader })

    expect(api.movePlayerToFixture("bed-1")).toBe(true)

    expect(Position.x[player]).toBe(400)
    expect(Position.y[player]).toBe(240)
  })

  it("moves the player to an npc interaction point", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const roomState = createRoomState()
    roomState.replaceNpcs([
      {
        id: "manager",
        name: "Manager",
        mapKey: "hallway",
        x: 352,
        y: 256,
        width: 32,
        height: 32,
      },
    ])
    const roomLoader = vi.fn(() => true)
    const api = createGameTestApi({ player, roomState, roomLoader })

    expect(api.movePlayerToNpc("manager")).toBe(true)

    expect(Position.x[player]).toBe(352)
    expect(Position.y[player]).toBe(240)
  })

  it("reports conversation state", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const roomState = createRoomState()
    const roomLoader = vi.fn(() => true)
    const conversationState = createConversationState()
    conversationState.open("Hello!")
    const api = createGameTestApi({
      player,
      roomState,
      roomLoader,
      conversationState,
    })

    expect(api.getConversation()).toEqual({
      isOpen: true,
      message: "Hello!",
    })
  })

  it("reports fixture cleaning state", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const roomState = createRoomState()
    roomState.replaceFixtures([
      {
        id: "bed-1",
        type: "bed",
        x: 320,
        y: 160,
        width: 160,
        height: 160,
        durationMs: 4000,
        state: "cleaning",
        progressMs: 1500,
      },
    ])
    const roomLoader = vi.fn(() => true)
    const api = createGameTestApi({ player, roomState, roomLoader })

    expect(api.getFixtureState("bed-1")).toEqual({
      state: "cleaning",
      progressMs: 1500,
    })
    expect(api.getFixtureState("missing")).toBeNull()
  })

  it("reports the player position", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 120, y: 80 })
    const roomState = createRoomState()
    const roomLoader = vi.fn(() => true)
    const api = createGameTestApi({ player, roomState, roomLoader })

    expect(api.getPlayerPosition()).toEqual({ x: 120, y: 80 })
  })

  it("reports the current map key", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const roomState = createRoomState()
    const roomLoader = Object.assign(
      vi.fn(() => true),
      {
        getCurrentMapKey: vi.fn(() => "room1"),
      },
    )
    const api = createGameTestApi({ player, roomState, roomLoader })

    expect(api.getCurrentMapKey()).toBe("room1")
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
        movePlayerToFixture: expect.any(Function),
        getPlayerPosition: expect.any(Function),
        getFixtureState: expect.any(Function),
        getCurrentMapKey: expect.any(Function),
      }),
    )
  })
})
