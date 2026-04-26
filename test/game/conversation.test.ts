import { describe, expect, it, vi } from "vitest"
import {
  createConversationStarter,
  createConversationState,
  createConversationSystem,
  getConversationDisplayText,
} from "@/src/game/conversation"
import { createGameWorld } from "@/src/ecs/world"
import { createGameText } from "@/src/game/localization"

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
      "Chief: I'm so hungry for lunch maybe I'll eat some chocolate covered almonds with a 10oz whiskey to wash it down!",
    )
    expect(input.pushContext).toHaveBeenCalledWith("dialog")
  })

  it("opens the npc greeting for the selected locale", () => {
    const state = createConversationState()
    const input = {
      pushContext: vi.fn(),
    }
    const starter = createConversationStarter(
      state,
      input,
      createGameText("es"),
    )

    starter.startConversation({
      id: "manager",
      name: "Manager",
      mapKey: "hallway",
      x: 352,
      y: 256,
      width: 32,
      height: 32,
    })

    expect(state.message).toBe(
      "Chief: Tengo tanta hambre para el almuerzo que tal vez coma almendras cubiertas de chocolate con un whisky de 10 oz para acompaniarlas!",
    )
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

  it("notifies when the dialog closes", () => {
    const world = createGameWorld()
    const state = createConversationState()
    state.open("Hello!")
    const input = {
      consume: vi.fn((action: string) => action === "interact"),
      popContext: vi.fn(),
    }
    const onClose = vi.fn()

    const system = createConversationSystem(state, input, onClose)
    system(world, 0)

    expect(onClose).toHaveBeenCalledTimes(1)
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

  it("advances the chief greeting to response choices", () => {
    const world = createGameWorld()
    const state = createConversationState()
    const input = {
      pushContext: vi.fn(),
      popContext: vi.fn(),
      consume: vi.fn((action: string) => action === "interact"),
    }
    const starter = createConversationStarter(state, input)
    const system = createConversationSystem(state, input)

    starter.startConversation({
      id: "manager",
      name: "Manager",
      mapKey: "hallway",
      x: 352,
      y: 256,
      width: 32,
      height: 32,
    })

    system(world, 0)

    expect(state.isOpen).toBe(true)
    expect(state.isChoosing).toBe(true)
    expect(getConversationDisplayText(state)).toBe(
      [
        "> Maybe you should eat some vegetables and row!",
        "  Chief anything you do I am 100% in favor of!",
      ].join("\n"),
    )
    expect(input.popContext).not.toHaveBeenCalled()
  })

  it("shows chief's vegetable reply before closing", () => {
    const world = createGameWorld()
    const state = createConversationState()
    const input = {
      pushContext: vi.fn(),
      popContext: vi.fn(),
      consume: vi.fn((action: string) => action === "interact"),
    }
    const starter = createConversationStarter(state, input)
    const system = createConversationSystem(state, input)

    starter.startConversation({
      id: "manager",
      name: "Manager",
      mapKey: "hallway",
      x: 352,
      y: 256,
      width: 32,
      height: 32,
    })

    system(world, 0)
    system(world, 0)

    expect(state.isOpen).toBe(true)
    expect(state.isChoosing).toBe(false)
    expect(getConversationDisplayText(state)).toBe(
      "Chief: Chiiiiiiiiii!  I'm 147.3 and proud of it!",
    )
    expect(input.popContext).not.toHaveBeenCalled()

    system(world, 0)

    expect(state.isOpen).toBe(false)
    expect(input.popContext).toHaveBeenCalledTimes(1)
  })

  it("shows chief's favor reply before closing", () => {
    const world = createGameWorld()
    const state = createConversationState()
    let pressed: string | null = "interact"
    const input = {
      pushContext: vi.fn(),
      popContext: vi.fn(),
      consume: vi.fn((action: string) => {
        if (pressed !== action) return false
        pressed = null
        return true
      }),
    }
    const starter = createConversationStarter(state, input)
    const system = createConversationSystem(state, input)

    starter.startConversation({
      id: "manager",
      name: "Manager",
      mapKey: "hallway",
      x: 352,
      y: 256,
      width: 32,
      height: 32,
    })

    system(world, 0)
    pressed = "moveDown"
    system(world, 0)
    pressed = "interact"
    system(world, 0)

    expect(state.isOpen).toBe(true)
    expect(state.isChoosing).toBe(false)
    expect(getConversationDisplayText(state)).toBe(
      "Chief: Thank u bubby, treat me gentle!  *Gulp gulp gulp*",
    )
    expect(input.popContext).not.toHaveBeenCalled()

    pressed = "interact"
    system(world, 0)

    expect(state.isOpen).toBe(false)
    expect(input.popContext).toHaveBeenCalledTimes(1)
  })

  it("moves the selected chief response with up and down input", () => {
    const world = createGameWorld()
    const state = createConversationState()
    let pressed: string | null = "interact"
    const input = {
      pushContext: vi.fn(),
      popContext: vi.fn(),
      consume: vi.fn((action: string) => {
        if (pressed !== action) return false
        pressed = null
        return true
      }),
    }
    const starter = createConversationStarter(state, input)
    const system = createConversationSystem(state, input)

    starter.startConversation({
      id: "manager",
      name: "Manager",
      mapKey: "hallway",
      x: 352,
      y: 256,
      width: 32,
      height: 32,
    })

    system(world, 0)
    pressed = "moveDown"
    system(world, 0)

    expect(state.selectedChoiceIndex).toBe(1)
    expect(getConversationDisplayText(state)).toBe(
      [
        "  Maybe you should eat some vegetables and row!",
        "> Chief anything you do I am 100% in favor of!",
      ].join("\n"),
    )

    pressed = "moveUp"
    system(world, 0)

    expect(state.selectedChoiceIndex).toBe(0)
    expect(getConversationDisplayText(state)).toBe(
      [
        "> Maybe you should eat some vegetables and row!",
        "  Chief anything you do I am 100% in favor of!",
      ].join("\n"),
    )
  })
})
