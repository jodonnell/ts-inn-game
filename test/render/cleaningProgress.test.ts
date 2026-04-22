import { describe, expect, it, vi } from "vitest"
import { createGameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import { createRoomState } from "@/src/game/roomState"
import {
  createCleaningProgressSystem,
  type CleaningProgressStore,
} from "@/src/render/cleaningProgress"

describe("cleaning progress system", () => {
  it("centers a progress bar above the player's head while cleaning", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 100, y: 120 })
    const bar = {
      x: 0,
      y: 0,
      visible: false,
      progress: 0,
      setProgress: vi.fn(),
    }
    const store: CleaningProgressStore = {
      bar: null,
      createBar: () => bar,
      addBar: () => {},
    }
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
        progressMs: 1000,
      },
    ])
    roomState.setActiveFixtureId("bed-1")

    const system = createCleaningProgressSystem(player, roomState, store)
    system(world, 0)

    expect(store.bar).toBe(bar)
    expect(bar.x).toBe(100)
    expect(bar.y).toBe(48)
    expect(bar.visible).toBe(true)
    expect(bar.setProgress).toHaveBeenCalledWith(0.25)
  })

  it("hides the progress bar when no active fixture is cleaning", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 100, y: 120 })
    const bar = {
      x: 0,
      y: 0,
      visible: true,
      progress: 1,
      setProgress: vi.fn(),
    }
    const store: CleaningProgressStore = {
      bar,
      createBar: () => bar,
      addBar: () => {},
    }
    const roomState = createRoomState()

    const system = createCleaningProgressSystem(player, roomState, store)
    system(world, 0)

    expect(bar.visible).toBe(false)
  })
})
