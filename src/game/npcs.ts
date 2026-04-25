import type { CollisionWall } from "@/src/ecs/systems/movement"
import type { RoomNpc } from "@/src/game/roomState"

export const HALLWAY_MANAGER_NPC: RoomNpc = {
  id: "manager",
  name: "Manager",
  x: 352,
  y: 256,
  width: 32,
  height: 32,
}

export const getRoomNpcs = (mapKey: string): RoomNpc[] =>
  mapKey === "hallway" ? [HALLWAY_MANAGER_NPC] : []

export const getNpcCollisionWall = (npc: RoomNpc): CollisionWall => ({
  x: npc.x - npc.width / 4,
  y: npc.y - npc.height / 4,
  width: npc.width / 2,
  height: npc.height / 4,
})
