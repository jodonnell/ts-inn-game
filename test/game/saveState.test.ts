import { describe, expect, it } from "vitest"
import { Position } from "@/src/ecs/components"
import { createSaveSnapshot, SAVE_VERSION } from "@/src/game/saveState"

describe("save state", () => {
  it("builds a minimal versioned save snapshot from gameplay state", () => {
    const player = 3
    Position.x[player] = 128
    Position.y[player] = 256

    const save = createSaveSnapshot({
      player,
      gameTime: {
        minutes: 345,
        daysPassed: 2,
      },
      roomState: {
        fixtures: [
          {
            id: "bed-1",
            type: "bed",
            x: 40,
            y: 50,
            width: 64,
            height: 32,
            durationMs: 4000,
            state: "cleaning",
            progressMs: 1800,
          },
          {
            id: "bed-2",
            type: "bed",
            x: 80,
            y: 50,
            width: 64,
            height: 32,
            durationMs: 4000,
            state: "clean",
            progressMs: 4000,
          },
        ],
      },
      roomLoader: {
        getCurrentMapKey: () => "tiledRoom",
      },
    })

    expect(save).toEqual({
      version: SAVE_VERSION,
      player: {
        x: 128,
        y: 256,
      },
      roomKey: "tiledRoom",
      time: {
        minutes: 345,
        daysPassed: 2,
      },
      fixtures: [
        {
          id: "bed-1",
          state: "cleaning",
          progressMs: 1800,
        },
        {
          id: "bed-2",
          state: "clean",
          progressMs: 4000,
        },
      ],
    })
  })
})
