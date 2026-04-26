import type { RoomNpc } from "@/src/game/roomState"
import type { GameWorld } from "@/src/ecs/world"
import type { InputContext } from "@/src/input/router"

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

const DEFAULT_NPC_GREETING =
  "Hi, my name is Chief!  I'm so hungry for lunch maybe I'll eat some chocolate covered almonds with a 10oz whiskey to wash it down!"

export const createConversationStarter = (
  state: ConversationState = createConversationState(),
  input?: Pick<ConversationInput, "pushContext">,
): ConversationStarter => ({
  startConversation: (npc) => {
    void npc
    state.open(DEFAULT_NPC_GREETING)
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
