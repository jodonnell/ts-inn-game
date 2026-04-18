import type { TiledMap, TiledObject, TiledObjectLayer } from "@/src/maps/tiled"

export const createEmptyRoomMap = (): TiledMap => ({
  width: 1,
  height: 1,
  tilewidth: 32,
  tileheight: 32,
  layers: [
    {
      type: "tilelayer",
      name: "ground",
      width: 1,
      height: 1,
      data: [0],
    },
    {
      type: "objectgroup",
      name: "objects",
      objects: [],
    },
  ],
  tilesets: [{ firstgid: 1 }],
})

const cloneObject = (object: TiledObject): TiledObject => ({
  ...object,
  properties: object.properties?.map((property) => ({ ...property })),
})

const cloneMap = (map: TiledMap): TiledMap => ({
  ...map,
  layers: map.layers.map((layer) =>
    layer.type === "tilelayer"
      ? { ...layer, data: [...layer.data] }
      : { ...layer, objects: layer.objects.map(cloneObject) },
  ),
  tilesets: map.tilesets.map((tileset) => ({ ...tileset })),
})

const withObject = (map: TiledMap, object: TiledObject): TiledMap => {
  const nextMap = cloneMap(map)
  const objectLayer = nextMap.layers.find(
    (layer): layer is TiledObjectLayer => layer.type === "objectgroup",
  )
  if (!objectLayer) {
    throw new Error("Expected object layer in empty room map")
  }
  objectLayer.objects.push({
    ...cloneObject(object),
    id: objectLayer.objects.length + 1,
  })
  return nextMap
}

export const withSpawn = (
  map: TiledMap,
  options: { id: string; x: number; y: number },
): TiledMap =>
  withObject(map, {
    id: 0,
    x: options.x,
    y: options.y,
    width: 0,
    height: 0,
    properties: [{ name: "player_spawn", type: "string", value: options.id }],
  })

export const withTeleport = (
  map: TiledMap,
  options: {
    x: number
    y: number
    width: number
    height: number
    targetMapKey: string
    spawnId?: string
  },
): TiledMap =>
  withObject(map, {
    id: 0,
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
    properties: [
      { name: "teleport", type: "string", value: options.targetMapKey },
      ...(options.spawnId
        ? [
            {
              name: "teleport_spawn",
              type: "string",
              value: options.spawnId,
            },
          ]
        : []),
    ],
  })

export const withInteraction = (
  map: TiledMap,
  options: { id: string; x: number; y: number; width: number; height: number },
): TiledMap =>
  withObject(map, {
    id: 0,
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
    properties: [{ name: "interaction", type: "string", value: options.id }],
  })

export const withCollision = (
  map: TiledMap,
  options: { x: number; y: number; width: number; height: number },
): TiledMap =>
  withObject(map, {
    id: 0,
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
    properties: [{ name: "collision", type: "bool", value: true }],
  })
