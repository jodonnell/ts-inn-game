import { describe, expect, it } from "vitest"
import { createGameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import { Position } from "@/src/ecs/components"
import {
  createInteractionPromptSystem,
  type InteractionPoint,
  type PromptStore,
} from "@/src/render/interactionPrompt"

describe("interaction prompt system", () => {
  it("shows the prompt near the interaction point and hides it otherwise", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const prompt = { x: 0, y: 0, visible: false }
    const store: PromptStore = {
      prompt: null,
      createPrompt: () => prompt,
      addPrompt: () => {},
    }
    const interaction: InteractionPoint = { x: 10, y: 0, radius: 5 }

    const system = createInteractionPromptSystem(player, store, interaction)
    system(world, 0)

    expect(store.prompt).toBe(prompt)
    expect(prompt.visible).toBe(false)

    Position.x[player] = 8
    Position.y[player] = 0

    system(world, 0)

    expect(prompt.visible).toBe(true)
    expect(prompt.x).toBe(10)
    expect(prompt.y).toBe(0)

    Position.x[player] = 30
    Position.y[player] = 0

    system(world, 0)

    expect(prompt.visible).toBe(false)
  })
})
