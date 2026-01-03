import { describe, expect, it, vi } from "vitest"
import { createRoomLoader } from "@/src/game/roomLoader"
import { createGameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import { Position } from "@/src/ecs/components"
import type { CollisionWall } from "@/src/ecs/systems/movement"
import type { TeleportState } from "@/src/ecs/systems/teleport"
import type { InteractionPoint } from "@/src/render/interactionPrompt"
import type { TiledMap } from "@/src/maps/tiled"

describe("room loader", () => {
  it("loads map data into room state and moves the player", () => {
    const map: TiledMap = {
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
          data: [1],
        },
        {
          type: "objectgroup",
          name: "objects",
          objects: [
            {
              id: 1,
              name: "player_spawn",
              x: 100,
              y: 120,
              width: 0,
              height: 0,
            },
            {
              id: 2,
              x: 10,
              y: 20,
              width: 16,
              height: 16,
              properties: [{ name: "teleport", type: "string", value: "inn" }],
            },
            {
              id: 3,
              x: 200,
              y: 220,
              width: 20,
              height: 10,
              properties: [
                { name: "interaction", type: "string", value: "bell" },
              ],
            },
            {
              id: 4,
              x: 40,
              y: 50,
              width: 30,
              height: 10,
              properties: [{ name: "collision", type: "bool", value: true }],
            },
          ],
        },
      ],
      tilesets: [{ firstgid: 1 }],
    }

    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const collisionWalls: CollisionWall[] = []
    const interactionPoint: InteractionPoint = {
      x: 0,
      y: 0,
      radius: 0,
      offsetY: 0,
      bounds: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    }
    const teleportState: TeleportState = { zones: [] }
    const mapContainer = {
      addChild: vi.fn(),
      removeChildren: vi.fn(),
    }
    const tileSpriteFactory = vi.fn(() => ({ x: 0, y: 0 }))
    const loadRoom = createRoomLoader({
      mapsByKey: { room1: map },
      player,
      mapContainer,
      tileSpriteFactory,
      collisionWalls,
      interactionPoint,
      teleportState,
    })

    const loaded = loadRoom("room1")

    expect(loaded).toBe(true)
    expect(Position.x[player]).toBe(100)
    expect(Position.y[player]).toBe(120)
    expect(collisionWalls).toEqual([{ x: 40, y: 50, width: 30, height: 10 }])
    expect(teleportState.zones).toEqual([
      { x: 10, y: 20, width: 16, height: 16, targetMapKey: "inn" },
    ])
    expect(interactionPoint).toEqual({
      x: 210,
      y: 225,
      radius: 10,
      offsetY: 16,
      bounds: {
        x: 200,
        y: 220,
        width: 20,
        height: 10,
      },
    })
    expect(mapContainer.removeChildren).toHaveBeenCalledTimes(1)
    expect(mapContainer.addChild).toHaveBeenCalledTimes(1)
  })

  it("uses the default spawn when the map has no player spawn", () => {
    const map: TiledMap = {
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
      ],
      tilesets: [{ firstgid: 1 }],
    }

    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const collisionWalls: CollisionWall[] = []
    const interactionPoint: InteractionPoint = {
      x: 0,
      y: 0,
      radius: 0,
      offsetY: 0,
      bounds: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    }
    const teleportState: TeleportState = { zones: [] }
    const mapContainer = {
      addChild: vi.fn(),
      removeChildren: vi.fn(),
    }
    const tileSpriteFactory = vi.fn(() => ({ x: 0, y: 0 }))
    const loadRoom = createRoomLoader({
      mapsByKey: { room1: map },
      player,
      mapContainer,
      tileSpriteFactory,
      collisionWalls,
      interactionPoint,
      teleportState,
    })

    const loaded = loadRoom("room1")

    expect(loaded).toBe(true)
    expect(Position.x[player]).toBe(200)
    expect(Position.y[player]).toBe(200)
  })
})
