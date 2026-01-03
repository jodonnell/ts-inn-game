import { describe, expect, it } from "vitest"
import {
  buildTilePlacements,
  extractCollisionWalls,
  extractTeleportZones,
  findInteractionPoint,
  findSpawnPoint,
  type TiledMap,
} from "@/src/maps/tiled"

describe("tiled map helpers", () => {
  it("builds tile placements from a layer and firstgid", () => {
    const map: TiledMap = {
      width: 2,
      height: 2,
      tilewidth: 32,
      tileheight: 32,
      layers: [
        {
          type: "tilelayer",
          name: "ground",
          width: 2,
          height: 2,
          data: [0, 5, 6, 0],
        },
      ],
      tilesets: [{ firstgid: 1 }],
    }

    const placements = buildTilePlacements(
      map.layers[0],
      map.tilewidth,
      map.tileheight,
      map.tilesets[0].firstgid,
    )

    expect(placements).toEqual([
      { x: 32, y: 0, tileId: 4 },
      { x: 0, y: 32, tileId: 5 },
    ])
  })

  it("extracts collision walls only when collision property is true", () => {
    const map: TiledMap = {
      width: 1,
      height: 1,
      tilewidth: 32,
      tileheight: 32,
      layers: [
        {
          type: "objectgroup",
          name: "collision",
          objects: [
            {
              id: 1,
              x: 10,
              y: 20,
              width: 30,
              height: 40,
              properties: [
                { name: "teleport", type: "string", value: "room1" },
              ],
            },
            {
              id: 2,
              x: 50,
              y: 60,
              width: 12,
              height: 14,
              properties: [{ name: "collision", type: "bool", value: true }],
            },
          ],
        },
      ],
      tilesets: [{ firstgid: 1 }],
    }

    expect(extractCollisionWalls(map)).toEqual([
      { x: 50, y: 60, width: 12, height: 14 },
    ])
  })

  it("ignores teleport objects without collision property", () => {
    const map: TiledMap = {
      width: 1,
      height: 1,
      tilewidth: 32,
      tileheight: 32,
      layers: [
        {
          type: "objectgroup",
          name: "collision",
          objects: [
            {
              id: 1,
              x: 10,
              y: 20,
              width: 30,
              height: 40,
              properties: [
                { name: "teleport", type: "string", value: "room1" },
              ],
            },
          ],
        },
      ],
      tilesets: [{ firstgid: 1 }],
    }

    expect(extractCollisionWalls(map)).toEqual([])
  })

  it("ignores objects without collision property even in collision layers", () => {
    const map: TiledMap = {
      width: 1,
      height: 1,
      tilewidth: 32,
      tileheight: 32,
      layers: [
        {
          type: "objectgroup",
          name: "collision",
          objects: [
            {
              id: 1,
              x: 10,
              y: 20,
              width: 30,
              height: 40,
            },
          ],
        },
      ],
      tilesets: [{ firstgid: 1 }],
    }

    expect(extractCollisionWalls(map)).toEqual([])
  })

  it("finds the player spawn point by name or type", () => {
    const map: TiledMap = {
      width: 1,
      height: 1,
      tilewidth: 32,
      tileheight: 32,
      layers: [
        {
          type: "objectgroup",
          name: "spawns",
          objects: [
            { id: 1, name: "player_spawn", x: 64, y: 96, width: 0, height: 0 },
          ],
        },
      ],
      tilesets: [{ firstgid: 1 }],
    }

    expect(findSpawnPoint(map, "player_spawn")).toEqual({ x: 64, y: 96 })
  })

  it("finds interaction points by property and builds a radius", () => {
    const map: TiledMap = {
      width: 1,
      height: 1,
      tilewidth: 32,
      tileheight: 32,
      layers: [
        {
          type: "objectgroup",
          name: "collision",
          objects: [
            {
              id: 1,
              x: 100,
              y: 120,
              width: 20,
              height: 10,
              properties: [
                { name: "interaction", type: "string", value: "bell" },
              ],
            },
          ],
        },
      ],
      tilesets: [{ firstgid: 1 }],
    }

    expect(findInteractionPoint(map, "bell")).toEqual({
      x: 110,
      y: 125,
      radius: 10,
      offsetY: 16,
      bounds: {
        x: 100,
        y: 120,
        width: 20,
        height: 10,
      },
    })
  })

  it("extracts teleport zones with target map keys", () => {
    const map: TiledMap = {
      width: 1,
      height: 1,
      tilewidth: 32,
      tileheight: 32,
      layers: [
        {
          type: "objectgroup",
          name: "triggers",
          objects: [
            {
              id: 1,
              x: 10,
              y: 20,
              width: 32,
              height: 24,
              properties: [
                { name: "teleport", type: "string", value: "room1" },
              ],
            },
          ],
        },
      ],
      tilesets: [{ firstgid: 1 }],
    }

    expect(extractTeleportZones(map)).toEqual([
      { x: 10, y: 20, width: 32, height: 24, targetMapKey: "room1" },
    ])
  })
})
