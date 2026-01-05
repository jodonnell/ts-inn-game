import type { CollisionWall } from "@/src/ecs/systems/movement"
import type { TeleportState } from "@/src/ecs/systems/teleport"
import type { InteractionPoint } from "@/src/render/interactionPrompt"
import type { TeleportZone } from "@/src/maps/tiled"
import { createDefaultInteractionPoint } from "@/src/game/fixtures"

export type RoomState = {
  collisionWalls: CollisionWall[]
  interactionPoint: InteractionPoint
  teleportState: TeleportState
  replaceCollisionWalls: (walls: CollisionWall[]) => void
  replaceInteractionPoint: (point: InteractionPoint) => void
  replaceTeleportZones: (zones: TeleportZone[]) => void
}

const replaceArray = <T>(target: T[], items: T[]) => {
  target.length = 0
  target.push(...items)
}

const copyInteractionPoint = (
  target: InteractionPoint,
  source: InteractionPoint,
) => {
  target.x = source.x
  target.y = source.y
  target.radius = source.radius
  target.offsetY = source.offsetY
  target.bounds.x = source.bounds.x
  target.bounds.y = source.bounds.y
  target.bounds.width = source.bounds.width
  target.bounds.height = source.bounds.height
}

export const createRoomState = (): RoomState => {
  const collisionWalls: CollisionWall[] = []
  const interactionPoint = createDefaultInteractionPoint()
  const teleportState: TeleportState = { zones: [] }

  return {
    collisionWalls,
    interactionPoint,
    teleportState,
    replaceCollisionWalls: (walls) => {
      replaceArray(collisionWalls, walls)
    },
    replaceInteractionPoint: (point) => {
      copyInteractionPoint(interactionPoint, point)
    },
    replaceTeleportZones: (zones) => {
      replaceArray(teleportState.zones, zones)
    },
  }
}
