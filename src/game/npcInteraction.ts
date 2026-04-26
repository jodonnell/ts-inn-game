import {
  type InteractionPoint,
  isWithinInteractionRange,
} from "@/src/game/fixtureInteraction"
import type { RoomNpc } from "@/src/game/roomState"

const NPC_INTERACTION_RADIUS = 32

export const getNpcInteractionPoint = (npc: RoomNpc): InteractionPoint => {
  const bounds = {
    x: npc.x - npc.width / 2,
    y: npc.y - npc.height,
    width: npc.width,
    height: npc.height,
  }
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
    radius: NPC_INTERACTION_RADIUS,
    offsetY: npc.height,
    bounds,
  }
}

export const findNpcInInteractionRange = (
  x: number,
  y: number,
  npcs: RoomNpc[],
): RoomNpc | null =>
  npcs.find((npc) =>
    isWithinInteractionRange(x, y, getNpcInteractionPoint(npc)),
  ) ?? null
