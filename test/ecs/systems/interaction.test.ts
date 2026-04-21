import { describe, expect, it, vi } from "vitest"
import { createGameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import { createInteractionSystem } from "@/src/ecs/systems/interaction"
import { createRoomState } from "@/src/game/roomState"

describe("interaction system", () => {
  it("plays a sound when interacting within range", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const input = { consumeInteraction: () => true }
    const roomState = createRoomState()
    roomState.replaceInteractionPoint({
      x: 0,
      y: 0,
      radius: 1,
      bounds: { x: 0, y: 0, width: 0, height: 0 },
    })
    const sound = { play: vi.fn() }

    const system = createInteractionSystem(player, input, roomState, sound)
    system(world, 0)

    expect(sound.play).toHaveBeenCalledTimes(1)
  })

  it("skips sound when interacting out of range", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 10, y: 10 })
    const input = { consumeInteraction: () => true }
    const roomState = createRoomState()
    roomState.replaceInteractionPoint({
      x: 0,
      y: 0,
      radius: 1,
      bounds: { x: 0, y: 0, width: 0, height: 0 },
    })
    const sound = { play: vi.fn() }

    const system = createInteractionSystem(player, input, roomState, sound)
    system(world, 0)

    expect(sound.play).not.toHaveBeenCalled()
  })

  it("keeps using the bell interaction path while fixture actions are unimplemented", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const input = { consumeInteraction: () => true }
    const roomState = createRoomState()
    roomState.replaceInteractionPoint({
      x: 0,
      y: 0,
      radius: 1,
      bounds: { x: 0, y: 0, width: 0, height: 0 },
    })
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
    const sound = { play: vi.fn() }

    const system = createInteractionSystem(player, input, roomState, sound)
    system(world, 0)

    expect(sound.play).toHaveBeenCalledTimes(1)
  })
})
