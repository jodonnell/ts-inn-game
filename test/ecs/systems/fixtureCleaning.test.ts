import { describe, expect, it } from "vitest"
import { createGameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import { createRoomState } from "@/src/game/roomState"
import { createFixtureCleaningSystem } from "@/src/ecs/systems/fixtureCleaning"

describe("fixture cleaning system", () => {
  it("starts cleaning and advances progress while interaction is held", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
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
    roomState.setActiveFixtureId("bed-1")
    const input = { isHeld: (_action: string) => true }

    const system = createFixtureCleaningSystem(player, input, roomState)
    system(world, 0.5)

    expect(roomState.fixtures[0]).toEqual(
      expect.objectContaining({
        state: "cleaning",
        progressMs: 500,
      }),
    )
  })

  it("completes cleaning when progress reaches duration", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
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
    roomState.setActiveFixtureId("bed-1")
    const input = { isHeld: (_action: string) => true }

    const system = createFixtureCleaningSystem(player, input, roomState)
    system(world, 4)

    expect(roomState.fixtures[0]).toEqual(
      expect.objectContaining({
        state: "clean",
        progressMs: 4000,
      }),
    )
  })

  it("decays cleaning progress when interaction is released", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
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
        state: "cleaning",
        progressMs: 1500,
      },
    ])
    roomState.setActiveFixtureId("bed-1")
    const input = { isHeld: (_action: string) => false }

    const system = createFixtureCleaningSystem(player, input, roomState)
    system(world, 0.25)

    expect(roomState.fixtures[0]).toEqual(
      expect.objectContaining({
        state: "cleaning",
        progressMs: 1250,
      }),
    )
  })

  it("resets cleaning when no fixture is active", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
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
        state: "cleaning",
        progressMs: 1500,
      },
    ])
    const input = { isHeld: (_action: string) => true }

    const system = createFixtureCleaningSystem(player, input, roomState)
    system(world, 0.25)

    expect(roomState.fixtures[0]).toEqual(
      expect.objectContaining({
        state: "dirty",
        progressMs: 0,
      }),
    )
  })
})
