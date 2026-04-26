import { describe, expect, it, vi } from "vitest"
import {
  createConversationStarter,
  createConversationState,
  createConversationSystem,
} from "@/src/game/conversation"
import { createGameWorld } from "@/src/ecs/world"

describe("conversation", () => {
  it("opens the default npc greeting and locks input when starting an npc conversation", () => {
    const state = createConversationState()
    const input = {
      pushContext: vi.fn(),
      popContext: vi.fn(),
      consume: vi.fn(),
    }
    const starter = createConversationStarter(state, input)

    starter.startConversation({
      id: "manager",
      name: "Manager",
      mapKey: "hallway",
      x: 352,
      y: 256,
      width: 32,
      height: 32,
    })

    expect(state.isOpen).toBe(true)
    expect(state.message).toBe(
      "Hi, my name is Chief!  I'm so hungry for lunch maybe I'll eat some chocolate covered almonds with a 10oz whiskey to wash it down!",
    )
    expect(input.pushContext).toHaveBeenCalledWith("dialog")
  })

  it("closes the dialog and unlocks input when interact is pressed", () => {
    const world = createGameWorld()
    const state = createConversationState()
    state.open("Hello!")
    const input = {
      consume: vi.fn((action: string) => action === "interact"),
      popContext: vi.fn(),
    }

    const system = createConversationSystem(state, input)
    system(world, 0)

    expect(state.isOpen).toBe(false)
    expect(state.message).toBe("")
    expect(input.popContext).toHaveBeenCalledTimes(1)
  })

  it("waits for interact before closing an open dialog", () => {
    const world = createGameWorld()
    const state = createConversationState()
    state.open("Hello!")
    const input = {
      consume: vi.fn(() => false),
      popContext: vi.fn(),
    }

    const system = createConversationSystem(state, input)
    system(world, 0)

    expect(state.isOpen).toBe(true)
    expect(input.popContext).not.toHaveBeenCalled()
  })
})
