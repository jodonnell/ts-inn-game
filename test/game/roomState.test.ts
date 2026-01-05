import { describe, expect, it } from "vitest"
import { createRoomState } from "@/src/game/roomState"

describe("room state", () => {
  it("replaces room data without changing references", () => {
    const state = createRoomState()
    const collisionRef = state.collisionWalls
    const interactionRef = state.interactionPoint
    const teleportZonesRef = state.teleportState.zones

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

    expect(state.collisionWalls).toBe(collisionRef)
    expect(state.collisionWalls).toEqual([{ x: 1, y: 2, width: 3, height: 4 }])
    expect(state.teleportState.zones).toBe(teleportZonesRef)
    expect(state.teleportState.zones).toEqual([
      { x: 10, y: 20, width: 30, height: 40, targetMapKey: "inn" },
    ])
    expect(state.interactionPoint).toBe(interactionRef)
    expect(state.interactionPoint).toEqual({
      x: 5,
      y: 6,
      radius: 7,
      offsetY: 8,
      bounds: { x: 9, y: 10, width: 11, height: 12 },
    })
  })
})
