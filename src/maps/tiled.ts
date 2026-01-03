import type { CollisionWall } from "@/src/ecs/systems/movement"
import type { InteractionPoint } from "@/src/render/interactionPrompt"

export type TiledProperty = {
  name: string
  type: string
  value: unknown
}

export type TiledObject = {
  id: number
  name?: string
  type?: string
  x: number
  y: number
  width: number
  height: number
  properties?: TiledProperty[]
}

export type TiledTileLayer = {
  type: "tilelayer"
  name: string
  width: number
  height: number
  data: number[]
}

export type TiledObjectLayer = {
  type: "objectgroup"
  name: string
  objects: TiledObject[]
}

export type TiledLayer = TiledTileLayer | TiledObjectLayer

export type TiledTilesetRef = {
  firstgid: number
  source?: string
}

export type TiledMap = {
  width: number
  height: number
  tilewidth: number
  tileheight: number
  layers: TiledLayer[]
  tilesets: TiledTilesetRef[]
}

export type TeleportZone = {
  x: number
  y: number
  width: number
  height: number
  targetMapKey: string
}

export type TilePlacement = {
  x: number
  y: number
  tileId: number
}

const getObjectProperty = (object: TiledObject, name: string) =>
  object.properties?.find((property) => property.name === name)?.value

export const buildTilePlacements = (
  layer: TiledTileLayer,
  tileWidth: number,
  tileHeight: number,
  firstGid: number,
): TilePlacement[] => {
  const placements: TilePlacement[] = []
  for (let index = 0; index < layer.data.length; index += 1) {
    const gid = layer.data[index]
    if (gid === 0) continue
    const tileId = gid - firstGid
    if (tileId < 0) continue
    const x = (index % layer.width) * tileWidth
    const y = Math.floor(index / layer.width) * tileHeight
    placements.push({ x, y, tileId })
  }
  return placements
}

export const extractCollisionWalls = (map: TiledMap): CollisionWall[] => {
  const walls: CollisionWall[] = []
  for (const layer of map.layers) {
    if (layer.type !== "objectgroup") continue
    for (const object of layer.objects) {
      const collisionFlag = getObjectProperty(object, "collision")
      const shouldCollide = collisionFlag === true
      if (!shouldCollide) continue
      if (object.width <= 0 || object.height <= 0) continue
      walls.push({
        x: object.x,
        y: object.y,
        width: object.width,
        height: object.height,
      })
    }
  }
  return walls
}

export const findSpawnPoint = (
  map: TiledMap,
  spawnId: string,
): { x: number; y: number } | null => {
  for (const layer of map.layers) {
    if (layer.type !== "objectgroup") continue
    const match = layer.objects.find(
      (object) => object.name === spawnId || object.type === spawnId,
    )
    if (match) return { x: match.x, y: match.y }
  }
  return null
}

export const findInteractionPoint = (
  map: TiledMap,
  interactionId: string,
): InteractionPoint | null => {
  for (const layer of map.layers) {
    if (layer.type !== "objectgroup") continue
    const match = layer.objects.find(
      (object) => getObjectProperty(object, "interaction") === interactionId,
    )
    if (!match) continue
    const radius = Math.max(match.width, match.height) / 2
    const centerX = match.x + match.width / 2
    const centerY = match.y + match.height / 2
    return {
      x: centerX,
      y: centerY,
      radius,
      offsetY: 16,
      bounds: {
        x: match.x,
        y: match.y,
        width: match.width,
        height: match.height,
      },
    }
  }
  return null
}

export const extractTeleportZones = (map: TiledMap): TeleportZone[] => {
  const zones: TeleportZone[] = []
  for (const layer of map.layers) {
    if (layer.type !== "objectgroup") continue
    for (const object of layer.objects) {
      const targetMapKey = getObjectProperty(object, "teleport")
      if (typeof targetMapKey !== "string") continue
      if (object.width <= 0 || object.height <= 0) continue
      zones.push({
        x: object.x,
        y: object.y,
        width: object.width,
        height: object.height,
        targetMapKey,
      })
    }
  }
  return zones
}
