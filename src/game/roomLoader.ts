import { Position } from "@/src/ecs/components"
import type { CollisionWall } from "@/src/ecs/systems/movement"
import type { InteractionPoint } from "@/src/render/interactionPrompt"
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
import type { RoomState } from "@/src/game/roomState"
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
  roomState: RoomState
  fallbackSpawn?: { x: number; y: number }
  interactionId?: string
  fallbackCollisionWalls?: CollisionWall[]
  fallbackInteractionPoint?: InteractionPoint
}

export type RoomLoader = ((mapKey: string, spawnId?: string) => boolean) & {
  unloadRoom: () => void
}

export const createRoomLoader = <TSprite extends TileSpriteLike>({
  mapsByKey,
  player,
  mapContainer,
  tileSpriteFactory,
  roomState,
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

  const unloadRoom = () => {
    activeMapKey = null
    mapContainer.removeChildren()
    roomState.replaceCollisionWalls(collisionFallback)
    roomState.replaceInteractionPoint(interactionFallback)
    roomState.replaceTeleportZones([])
  }

  const loadRoom = ((mapKey, spawnId) => {
    if (mapKey === activeMapKey) return false
    if (activeMapKey) loadRoom.unloadRoom()
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

    const spawn =
      (spawnId ? findSpawnPoint(map, spawnId) : null) ??
      findSpawnPoint(map, "player_spawn") ??
      spawnFallback
    Position.x[player] = spawn.x
    Position.y[player] = spawn.y

    const nextWalls = extractCollisionWalls(map)
    roomState.replaceCollisionWalls(
      nextWalls.length > 0 ? nextWalls : collisionFallback,
    )

    const nextInteraction =
      findInteractionPoint(map, interactionKey) ?? interactionFallback
    roomState.replaceInteractionPoint(nextInteraction)

    roomState.replaceTeleportZones(extractTeleportZones(map))

    return true
  }) as RoomLoader

  loadRoom.unloadRoom = unloadRoom

  return loadRoom
}
