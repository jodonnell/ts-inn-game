import { describe, expect, it, vi } from "vitest"
import { createGameWorld } from "@/src/ecs/world"
import { createConversationState } from "@/src/game/conversation"
import {
  createConversationDialogSystem,
  type ConversationDialogStore,
} from "@/src/render/conversationDialog"

describe("conversation dialog render system", () => {
  it("shows an open conversation message in a bottom dialog box", () => {
    const world = createGameWorld()
    const state = createConversationState()
    state.open("Hello!")
    const layout = vi.fn()
    const dialog = {
      x: 0,
      y: 0,
      text: "",
      visible: false,
      layout,
      container: {},
    }
    const store: ConversationDialogStore = {
      dialog: null,
      createDialog: () => dialog,
      addDialog: vi.fn(),
    }

    const system = createConversationDialogSystem(state, store)
    system(world, 0)

    expect(store.dialog).toBe(dialog)
    expect(dialog.text).toBe("Hello!")
    expect(dialog.x).toBe(16)
    expect(dialog.y).toBe(252)
    expect(dialog.visible).toBe(true)
    expect(layout).toHaveBeenCalled()
  })

  it("hides the dialog box when no conversation is open", () => {
    const world = createGameWorld()
    const state = createConversationState()
    const dialog = {
      x: 0,
      y: 0,
      text: "Hello!",
      visible: true,
      container: {},
    }
    const store: ConversationDialogStore = {
      dialog,
      createDialog: () => dialog,
      addDialog: vi.fn(),
    }

    const system = createConversationDialogSystem(state, store)
    system(world, 0)

    expect(dialog.visible).toBe(false)
  })
})
