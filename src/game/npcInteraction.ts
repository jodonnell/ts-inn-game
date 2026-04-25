import {
  type InteractionPoint,
  isWithinInteractionRange,
} from "@/src/game/fixtureInteraction"
import { getNpcCollisionWall } from "@/src/game/npcs"
import type { RoomNpc } from "@/src/game/roomState"

const NPC_INTERACTION_RADIUS = 16

export const getNpcInteractionPoint = (npc: RoomNpc): InteractionPoint => {
  const feet = getNpcCollisionWall(npc)
  return {
    x: feet.x + feet.width / 2,
    y: feet.y + feet.height / 2,
    radius: NPC_INTERACTION_RADIUS,
    offsetY: npc.height,
    bounds: feet,
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
