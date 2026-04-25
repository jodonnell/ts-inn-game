import type { RoomNpc } from "@/src/game/roomState"

export type ConversationStarter = {
  startConversation: (npc: RoomNpc) => void
}

export const createConversationStarter = (): ConversationStarter => ({
  startConversation: () => {},
})
