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

export type DialogChoice = {
  label: string
  next: DialogNode
}

export type DialogNode = {
  choices?: DialogChoice[]
  message: string
}

export type ConversationState = {
  choices: string[]
  isOpen: boolean
  isChoosing: boolean
  message: string
  selectedChoiceIndex: number
  open: (message: string) => void
  openNode: (node: DialogNode) => void
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
  let currentNode: DialogNode | null = null

  const showChoices = () => {
    mode = "choices"
    state.isChoosing = true
    state.selectedChoiceIndex = 0
  }

  const setNode = (node: DialogNode) => {
    currentNode = node
    state.isOpen = true
    state.isChoosing = false
    state.message = node.message
    mode = "message"
    state.choices = node.choices?.map((choice) => choice.label) ?? []
    state.selectedChoiceIndex = 0
  }

  const state: ConversationState = {
    choices: [],
    isOpen: false,
    isChoosing: false,
    message: "",
    selectedChoiceIndex: 0,
    open: (message) => setNode({ message }),
    openNode: setNode,
    close: () => {
      currentNode = null
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
      if (mode === "choices") {
        const nextNode = currentNode?.choices?.[state.selectedChoiceIndex]?.next
        if (nextNode) {
          setNode(nextNode)
          return
        }
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
    state.openNode(text.npcDialog(npc))
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
