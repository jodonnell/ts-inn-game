import { Position } from "@/src/ecs/components"
import type { CollisionWall } from "@/src/ecs/systems/movement"
import type { InteractionPoint } from "@/src/game/fixtureInteraction"
import type { TiledMap, TiledTileLayer } from "@/src/maps/tiled"
import {
  extractCollisionWalls,
  extractFixturePlacements,
  extractTeleportZones,
  findInteractionPoint,
  findSpawnPoint,
} from "@/src/maps/tiled"
import {
  createDefaultCollisionWalls,
  createDefaultInteractionPoint,
} from "@/src/game/fixtures"
import type { RoomFixture, RoomState } from "@/src/game/roomState"
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
  tileSpriteFactories: Record<string, TileSpriteFactory<TSprite>>
  roomState: RoomState
  fallbackSpawn?: { x: number; y: number }
  interactionId?: string
  fallbackCollisionWalls?: CollisionWall[]
  fallbackInteractionPoint?: InteractionPoint
}

export type RoomLoader = ((mapKey: string, spawnId?: string) => boolean) & {
  getCurrentMapKey: () => string | null
  unloadRoom: () => void
}

export const createRoomLoader = <TSprite extends TileSpriteLike>({
  mapsByKey,
  player,
  mapContainer,
  tileSpriteFactories,
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

  const buildRoomFixtures = (map: TiledMap): RoomFixture[] =>
    extractFixturePlacements(map).map((fixture) => ({
      ...fixture,
      state: "dirty",
      progressMs: 0,
    }))

  const unloadRoom = () => {
    activeMapKey = null
    mapContainer.removeChildren()
    roomState.replaceCollisionWalls(collisionFallback)
    roomState.replaceInteractionPoint(interactionFallback)
    roomState.replaceFixtures([])
    roomState.replaceTeleportZones([])
  }

  const loadRoom = ((mapKey, spawnId) => {
    if (mapKey === activeMapKey) return false
    if (activeMapKey) loadRoom.unloadRoom()
    const map = mapsByKey[mapKey]
    if (!map) return false
    const tileSpriteFactory = tileSpriteFactories[mapKey]
    if (!tileSpriteFactory) return false
    activeMapKey = mapKey

    mapContainer.removeChildren()
    const tileLayers = map.layers.filter(
      (layer): layer is TiledTileLayer => layer.type === "tilelayer",
    )
    for (const layer of tileLayers) {
      renderTileLayer(
        layer,
        map.tilewidth,
        map.tileheight,
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

    roomState.replaceFixtures(buildRoomFixtures(map))
    roomState.replaceTeleportZones(extractTeleportZones(map))

    return true
  }) as RoomLoader

  loadRoom.unloadRoom = unloadRoom
  loadRoom.getCurrentMapKey = () => activeMapKey

  return loadRoom
}
