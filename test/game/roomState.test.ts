import { describe, expect, it } from "vitest"
import { createRoomState } from "@/src/game/roomState"

describe("room state", () => {
  it("starts with interaction disabled", () => {
    const state = createRoomState()

    expect(state.interactionPoint).toEqual({
      enabled: false,
      x: 0,
      y: 0,
      radius: 0,
      offsetY: 0,
      bounds: { x: 0, y: 0, width: 0, height: 0 },
    })
  })

  it("replaces room data without changing references", () => {
    const state = createRoomState()
    const collisionRef = state.collisionWalls
    const interactionRef = state.interactionPoint
    const teleportZonesRef = state.teleportState.zones
    const fixturesRef = state.fixtures

    state.replaceCollisionWalls([{ x: 1, y: 2, width: 3, height: 4 }])
    state.replaceTeleportZones([
      { x: 10, y: 20, width: 30, height: 40, targetMapKey: "inn" },
    ])
    state.replaceInteractionPoint({
      x: 5,
      y: 6,
      radius: 7,
      offsetY: 8,
      bounds: { x: 9, y: 10, width: 11, height: 12 },
    })
    state.replaceFixtures([
      {
        id: "bed-1",
        type: "bed",
        x: 50,
        y: 60,
        width: 64,
        height: 32,
        durationMs: 4000,
        state: "dirty",
        progressMs: 0,
      },
    ])

    expect(state.collisionWalls).toBe(collisionRef)
    expect(state.collisionWalls).toEqual([{ x: 1, y: 2, width: 3, height: 4 }])
    expect(state.teleportState.zones).toBe(teleportZonesRef)
    expect(state.teleportState.zones).toEqual([
      { x: 10, y: 20, width: 30, height: 40, targetMapKey: "inn" },
    ])
    expect(state.interactionPoint).toBe(interactionRef)
    expect(state.interactionPoint).toEqual({
      enabled: undefined,
      x: 5,
      y: 6,
      radius: 7,
      offsetY: 8,
      bounds: { x: 9, y: 10, width: 11, height: 12 },
    })
    expect(state.fixtures).toBe(fixturesRef)
    expect(state.fixtures).toEqual([
      {
        id: "bed-1",
        type: "bed",
        x: 50,
        y: 60,
        width: 64,
        height: 32,
        durationMs: 4000,
        state: "dirty",
        progressMs: 0,
      },
    ])
  })

  it("tracks the active fixture id", () => {
    const state = createRoomState()

    expect(state.activeFixtureId).toBeNull()

    state.setActiveFixtureId("bed-1")
    expect(state.activeFixtureId).toBe("bed-1")

    state.setActiveFixtureId(null)
    expect(state.activeFixtureId).toBeNull()
  })

  it("tracks the active npc id", () => {
    const state = createRoomState()

    expect(state.activeNpcId).toBeNull()

    state.setActiveNpcId("manager")
    expect(state.activeNpcId).toBe("manager")

    state.setActiveNpcId(null)
    expect(state.activeNpcId).toBeNull()
  })

  it("clears the active npc id when npcs are replaced without that id", () => {
    const state = createRoomState()
    state.replaceNpcs([
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
    state.setActiveNpcId("manager")

    state.replaceNpcs([])

    expect(state.activeNpcId).toBeNull()
  })

  it("clears the active fixture id when fixtures are replaced without that id", () => {
    const state = createRoomState()
    state.replaceFixtures([
      {
        id: "bed-1",
        type: "bed",
        x: 50,
        y: 60,
        width: 64,
        height: 32,
        durationMs: 4000,
        state: "dirty",
        progressMs: 0,
      },
    ])
    state.setActiveFixtureId("bed-1")

    state.replaceFixtures([])

    expect(state.activeFixtureId).toBeNull()
  })
})
