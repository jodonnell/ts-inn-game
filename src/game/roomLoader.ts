import { Position } from "@/src/ecs/components"
import type { CollisionWall } from "@/src/ecs/systems/movement"
import type { InteractionPoint } from "@/src/render/interactionPrompt"
import type { TeleportState } from "@/src/ecs/systems/teleport"
import type { TiledMap, TiledTileLayer } from "@/src/maps/tiled"
import {
  extractCollisionWalls,
  extractTeleportZones,
  findInteractionPoint,
  findSpawnPoint,
} from "@/src/maps/tiled"
import {
  createDefaultCollisionWalls,
  createDefaultInteractionPoint,
} from "@/src/game/fixtures"
import type { TileSpriteFactory, TileSpriteLike } from "@/src/render/tilemap"
import { renderTileLayer } from "@/src/render/tilemap"

export type RoomRegistry = Record<string, TiledMap>

export type MapContainerLike<TSprite> = {
  addChild: (sprite: TSprite) => void
  removeChildren: () => void
}

type RoomLoaderOptions<TSprite extends TileSpriteLike> = {
  mapsByKey: RoomRegistry
  player: number
  mapContainer: MapContainerLike<TSprite>
  tileSpriteFactory: TileSpriteFactory<TSprite>
  collisionWalls: CollisionWall[]
  interactionPoint: InteractionPoint
  teleportState: TeleportState
  fallbackSpawn?: { x: number; y: number }
  interactionId?: string
  fallbackCollisionWalls?: CollisionWall[]
  fallbackInteractionPoint?: InteractionPoint
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

const replaceArray = <T>(target: T[], items: T[]) => {
  target.length = 0
  target.push(...items)
}

export const createRoomLoader = <TSprite extends TileSpriteLike>({
  mapsByKey,
  player,
  mapContainer,
  tileSpriteFactory,
  collisionWalls,
  interactionPoint,
  teleportState,
  fallbackSpawn,
  interactionId,
  fallbackCollisionWalls,
  fallbackInteractionPoint,
}: RoomLoaderOptions<TSprite>) => {
  const spawnFallback = fallbackSpawn ?? { x: 200, y: 200 }
  const interactionFallback =
    fallbackInteractionPoint ?? createDefaultInteractionPoint()
  const collisionFallback =
    fallbackCollisionWalls ?? createDefaultCollisionWalls()
  const interactionKey = interactionId ?? "bell"
  let activeMapKey: string | null = null

  return (mapKey: string): boolean => {
    if (mapKey === activeMapKey) return false
    const map = mapsByKey[mapKey]
    if (!map) return false
    activeMapKey = mapKey

    mapContainer.removeChildren()
    const tileLayers = map.layers.filter(
      (layer): layer is TiledTileLayer => layer.type === "tilelayer",
    )
    const firstGid = map.tilesets[0]?.firstgid ?? 1
    for (const layer of tileLayers) {
      renderTileLayer(
        layer,
        map.tilewidth,
        map.tileheight,
        firstGid,
        tileSpriteFactory,
        (sprite) => mapContainer.addChild(sprite),
      )
    }

    const spawn = findSpawnPoint(map, "player_spawn") ?? spawnFallback
    Position.x[player] = spawn.x
    Position.y[player] = spawn.y

    const nextWalls = extractCollisionWalls(map)
    replaceArray(
      collisionWalls,
      nextWalls.length > 0 ? nextWalls : collisionFallback,
    )

    const nextInteraction =
      findInteractionPoint(map, interactionKey) ?? interactionFallback
    copyInteractionPoint(interactionPoint, nextInteraction)

    replaceArray(teleportState.zones, extractTeleportZones(map))

    return true
  }
}
