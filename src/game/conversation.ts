import type { RoomNpc } from "@/src/game/roomState"
import type { GameWorld } from "@/src/ecs/world"
import type { InputAction } from "@/src/input/actions"
import type { InputContext } from "@/src/input/router"
import { createGameText, type GameText } from "@/src/game/localization"

export type ConversationStarter = {
  startConversation: (npc: RoomNpc) => void
}

export type ConversationInput = {
  consume: (action: InputAction) => boolean
  popContext: () => void
  pushContext: (context: Exclude<InputContext, "gameplay">) => void
}

type ConversationMode = "message" | "choices"

export type ConversationState = {
  choices: string[]
  isOpen: boolean
  isChoosing: boolean
  message: string
  selectedChoiceIndex: number
  open: (message: string, choices?: string[]) => void
  close: () => void
  moveChoice: (delta: number) => void
  select: () => void
}

const formatChoices = (choices: string[], selectedIndex: number) =>
  choices
    .map((choice, index) => `${index === selectedIndex ? ">" : " "} ${choice}`)
    .join("\n")

export const getConversationDisplayText = (state: ConversationState) =>
  state.isChoosing
    ? formatChoices(state.choices, state.selectedChoiceIndex)
    : state.message

export const createConversationState = (): ConversationState => {
  let mode: ConversationMode = "message"

  const showChoices = () => {
    mode = "choices"
    state.isChoosing = true
    state.selectedChoiceIndex = 0
  }

  const state: ConversationState = {
    choices: [],
    isOpen: false,
    isChoosing: false,
    message: "",
    selectedChoiceIndex: 0,
    open: (message, nextChoices = []) => {
      state.isOpen = true
      state.isChoosing = false
      state.message = message
      mode = "message"
      state.choices = nextChoices
      state.selectedChoiceIndex = 0
    },
    close: () => {
      state.isOpen = false
      state.isChoosing = false
      state.message = ""
      mode = "message"
      state.choices = []
      state.selectedChoiceIndex = 0
    },
    moveChoice: (delta) => {
      if (mode !== "choices") return
      state.selectedChoiceIndex = Math.max(
        0,
        Math.min(state.choices.length - 1, state.selectedChoiceIndex + delta),
      )
    },
    select: () => {
      if (mode === "message" && state.choices.length > 0) {
        showChoices()
        return
      }
      state.close()
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
    state.open(text.npcGreeting(npc), text.npcResponses(npc))
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
    if (input.consume("moveUp")) {
      state.moveChoice(-1)
      return
    }
    if (input.consume("moveDown")) {
      state.moveChoice(1)
      return
    }
    if (!input.consume("interact")) return

    state.select()
    if (!state.isOpen) input.popContext()
  }
