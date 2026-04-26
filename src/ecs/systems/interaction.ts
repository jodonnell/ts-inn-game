import type { InputAction } from "@/src/input/actions"
import { Position } from "@/src/ecs/components"
import type { GameWorld } from "@/src/ecs/world"
import {
  getCurrentInteractionPoint,
  isWithinInteractionRange,
} from "@/src/game/fixtureInteraction"
import type { ConversationStarter } from "@/src/game/conversation"
import { findNpcInInteractionRange } from "@/src/game/npcInteraction"
import type { RoomState } from "@/src/game/roomState"

export type InteractionInput = {
  consume: (action: InputAction) => boolean
}

export type InteractionSound = {
  play: () => void
}

const noopConversationStarter: ConversationStarter = {
  startConversation: () => {},
}

export const createInteractionSystem =
  (
    player: number,
    input: InteractionInput,
    roomState: RoomState,
    sound: InteractionSound,
    conversation: ConversationStarter = noopConversationStarter,
  ) =>
  (_world: GameWorld, _dt: number) => {
    void _world
    void _dt
    const playerX = Position.x[player]
    const playerY = Position.y[player]
    if (roomState.activeFixtureId) return
    const npc = findNpcInInteractionRange(playerX, playerY, roomState.npcs)
    if (npc) {
      if (!input.consume("interact")) return
      roomState.setActiveNpcId(npc.id)
      conversation.startConversation(npc)
      return
    }

    const interaction = getCurrentInteractionPoint(roomState)

    if (isWithinInteractionRange(playerX, playerY, interaction)) {
      if (!input.consume("interact")) return
      sound.play()
    }
  }
