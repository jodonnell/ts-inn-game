import type { CollisionWall } from "@/src/ecs/systems/movement"
import type { RoomNpc } from "@/src/game/roomState"

export const HALLWAY_MANAGER_NPC: RoomNpc = {
  id: "manager",
  name: "Manager",
  mapKey: "hallway",
  x: 704,
  y: 256,
  width: 32,
  height: 32,
}

export const getRoomNpcs = (mapKey: string): RoomNpc[] =>
  [HALLWAY_MANAGER_NPC].filter((npc) => npc.mapKey === mapKey)

export const getNpcCollisionWall = (npc: RoomNpc): CollisionWall => ({
  x: npc.x - npc.width / 4,
  y: npc.y - npc.height / 4,
  width: npc.width / 2,
  height: npc.height / 4,
})
