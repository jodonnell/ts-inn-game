import { describe, expect, it } from "vitest"
import {
  createEmptyRoomMap,
  withCollision,
  withInteraction,
  withSpawn,
  withTeleport,
} from "@/src/test-fixtures/emptyRoomMap"

describe("createEmptyRoomMap", () => {
  it("creates a minimal empty room map", () => {
    expect(createEmptyRoomMap()).toEqual({
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
  })

  it("composes map objects without mutating the original map", () => {
    const emptyMap = createEmptyRoomMap()

    const map = withCollision(
      withInteraction(
        withTeleport(withSpawn(emptyMap, { id: "pointA", x: 96, y: 224 }), {
          x: 64,
          y: 64,
          width: 32,
          height: 32,
          targetMapKey: "inn",
          spawnId: "pointA",
        }),
        { id: "bell", x: 384, y: 192, width: 32, height: 32 },
      ),
      { x: 320, y: 80, width: 20, height: 200 },
    )

    expect(emptyMap.layers).toEqual([
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
    ])

    expect(map.layers).toEqual([
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
        objects: [
          {
            id: 1,
            x: 96,
            y: 224,
            width: 0,
            height: 0,
            properties: [
              {
                name: "player_spawn",
                type: "string",
                value: "pointA",
              },
            ],
          },
          {
            id: 2,
            x: 64,
            y: 64,
            width: 32,
            height: 32,
            properties: [
              {
                name: "teleport",
                type: "string",
                value: "inn",
              },
              {
                name: "teleport_spawn",
                type: "string",
                value: "pointA",
              },
            ],
          },
          {
            id: 3,
            x: 384,
            y: 192,
            width: 32,
            height: 32,
            properties: [
              {
                name: "interaction",
                type: "string",
                value: "bell",
              },
            ],
          },
          {
            id: 4,
            x: 320,
            y: 80,
            width: 20,
            height: 200,
            properties: [
              {
                name: "collision",
                type: "bool",
                value: true,
              },
            ],
          },
        ],
      },
    ])
  })
})
