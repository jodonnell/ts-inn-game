import { describe, expect, it, vi } from "vitest"
import { createGameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import { createInteractionSystem } from "@/src/ecs/systems/interaction"

describe("interaction system", () => {
  it("plays a sound when interacting within range", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const input = { consumeInteraction: () => true }
    const interaction = {
      x: 0,
      y: 0,
      radius: 1,
      bounds: { x: 0, y: 0, width: 0, height: 0 },
    }
    const sound = { play: vi.fn() }

    const system = createInteractionSystem(player, input, interaction, sound)
    system(world, 0)

    expect(sound.play).toHaveBeenCalledTimes(1)
  })

  it("skips sound when interacting out of range", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 10, y: 10 })
    const input = { consumeInteraction: () => true }
    const interaction = {
      x: 0,
      y: 0,
      radius: 1,
      bounds: { x: 0, y: 0, width: 0, height: 0 },
    }
    const sound = { play: vi.fn() }

    const system = createInteractionSystem(player, input, interaction, sound)
    system(world, 0)

    expect(sound.play).not.toHaveBeenCalled()
  })
})
