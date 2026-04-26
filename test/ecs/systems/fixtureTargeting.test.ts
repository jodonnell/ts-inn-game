import { describe, expect, it } from "vitest"
import { createGameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import { Position } from "@/src/ecs/components"
import { createRoomState } from "@/src/game/roomState"
import { createFixtureTargetingSystem } from "@/src/ecs/systems/fixtureTargeting"

describe("fixture targeting system", () => {
  it("selects the nearest dirty fixture in range", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 94, y: 108 })
    const roomState = createRoomState()
    roomState.replaceFixtures([
      {
        id: "bed-1",
        type: "bed",
        x: 100,
        y: 100,
        width: 32,
        height: 32,
        durationMs: 4000,
        state: "dirty",
        progressMs: 0,
      },
      {
        id: "bed-2",
        type: "bed",
        x: 180,
        y: 100,
        width: 32,
        height: 32,
        durationMs: 4000,
        state: "dirty",
        progressMs: 0,
      },
    ])

    const system = createFixtureTargetingSystem(player, roomState)
    system(world, 0)

    expect(roomState.activeFixtureId).toBe("bed-1")
  })

  it("clears the active fixture when no targetable fixture is nearby", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const roomState = createRoomState()
    roomState.setActiveFixtureId("bed-1")
    roomState.replaceFixtures([
      {
        id: "bed-1",
        type: "bed",
        x: 100,
        y: 100,
        width: 32,
        height: 32,
        durationMs: 4000,
        state: "dirty",
        progressMs: 0,
      },
    ])

    const system = createFixtureTargetingSystem(player, roomState)
    system(world, 0)

    expect(roomState.activeFixtureId).toBeNull()
  })

  it("selects a bed from just outside its collision buffer", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 448, y: 305 })
    const roomState = createRoomState()
    roomState.replaceFixtures([
      {
        id: "bed-1",
        type: "bed",
        x: 416,
        y: 224,
        width: 64,
        height: 64,
        durationMs: 4000,
        state: "dirty",
        progressMs: 0,
      },
    ])

    const system = createFixtureTargetingSystem(player, roomState)
    system(world, 0)

    expect(roomState.activeFixtureId).toBe("bed-1")
  })

  it("ignores clean fixtures", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 110, y: 110 })
    const roomState = createRoomState()
    roomState.replaceFixtures([
      {
        id: "bed-1",
        type: "bed",
        x: 100,
        y: 100,
        width: 32,
        height: 32,
        durationMs: 4000,
        state: "clean",
        progressMs: 0,
      },
    ])

    const system = createFixtureTargetingSystem(player, roomState)
    system(world, 0)

    expect(roomState.activeFixtureId).toBeNull()
  })

  it("updates when the player moves away", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 110, y: 110 })
    const roomState = createRoomState()
    roomState.replaceFixtures([
      {
        id: "bed-1",
        type: "bed",
        x: 100,
        y: 100,
        width: 32,
        height: 32,
        durationMs: 4000,
        state: "dirty",
        progressMs: 0,
      },
    ])

    const system = createFixtureTargetingSystem(player, roomState)
    system(world, 0)
    expect(roomState.activeFixtureId).toBe("bed-1")

    Position.x[player] = 0
    Position.y[player] = 0
    system(world, 0.016)

    expect(roomState.activeFixtureId).toBeNull()
  })
})
