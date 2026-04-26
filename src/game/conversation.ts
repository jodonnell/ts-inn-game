import type { RoomNpc } from "@/src/game/roomState"
import type { GameWorld } from "@/src/ecs/world"
import type { InputContext } from "@/src/input/router"
import { createGameText, type GameText } from "@/src/game/localization"

export type ConversationStarter = {
  startConversation: (npc: RoomNpc) => void
}

export type ConversationInput = {
  consume: (action: "interact") => boolean
  popContext: () => void
  pushContext: (context: Exclude<InputContext, "gameplay">) => void
}

export type ConversationState = {
  isOpen: boolean
  message: string
  open: (message: string) => void
  close: () => void
}

export const createConversationState = (): ConversationState => {
  const state: ConversationState = {
    isOpen: false,
    message: "",
    open: (message) => {
      state.isOpen = true
      state.message = message
    },
    close: () => {
      state.isOpen = false
      state.message = ""
    },
  }

  return state
}

export const createConversationStarter = (
  state: ConversationState = createConversationState(),
  input?: Pick<ConversationInput, "pushContext">,
  text: GameText = createGameText(),
): ConversationStarter => ({
  startConversation: (npc) => {
    state.open(text.npcGreeting(npc))
    input?.pushContext("dialog")
  },
})

export const createConversationSystem =
  (
    state: ConversationState,
    input: Pick<ConversationInput, "consume" | "popContext">,
  ) =>
  (_world: GameWorld, _dt: number) => {
    void _world
    void _dt
    if (!state.isOpen) return
    if (!input.consume("interact")) return

    state.close()
    input.popContext()
  }
