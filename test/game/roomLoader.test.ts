import { describe, expect, it, vi } from "vitest"
import { createRoomLoader } from "@/src/game/roomLoader"
import { createGameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import { Position } from "@/src/ecs/components"
import type { TiledMap } from "@/src/maps/tiled"
import { createRoomState } from "@/src/game/roomState"

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
    const roomState = createRoomState()
    const mapContainer = {
      addChild: vi.fn(),
      removeChildren: vi.fn(),
    }
    const tileSpriteFactory = vi.fn(() => ({ x: 0, y: 0 }))
    const loadRoom = createRoomLoader({
      mapsByKey: { room1: map },
      player,
      mapContainer,
      tileSpriteFactories: { room1: tileSpriteFactory },
      roomState,
    })

    const loaded = loadRoom("room1")

    expect(loaded).toBe(true)
    expect(Position.x[player]).toBe(100)
    expect(Position.y[player]).toBe(120)
    expect(roomState.collisionWalls).toEqual([
      { x: 40, y: 50, width: 30, height: 10 },
    ])
    expect(roomState.teleportState.zones).toEqual([
      { x: 10, y: 20, width: 16, height: 16, targetMapKey: "inn" },
    ])
    expect(roomState.interactionPoint).toEqual({
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
    const roomState = createRoomState()
    const mapContainer = {
      addChild: vi.fn(),
      removeChildren: vi.fn(),
    }
    const tileSpriteFactory = vi.fn(() => ({ x: 0, y: 0 }))
    const loadRoom = createRoomLoader({
      mapsByKey: { room1: map },
      player,
      mapContainer,
      tileSpriteFactories: { room1: tileSpriteFactory },
      roomState,
    })

    const loaded = loadRoom("room1")

    expect(loaded).toBe(true)
    expect(Position.x[player]).toBe(200)
    expect(Position.y[player]).toBe(200)
  })

  it("uses a named spawn when provided", () => {
    const map: TiledMap = {
      width: 1,
      height: 1,
      tilewidth: 32,
      tileheight: 32,
      layers: [
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
              x: 300,
              y: 340,
              width: 0,
              height: 0,
              properties: [
                { name: "player_spawn", type: "string", value: "pointA" },
              ],
            },
          ],
        },
      ],
      tilesets: [{ firstgid: 1 }],
    }

    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const roomState = createRoomState()
    const mapContainer = {
      addChild: vi.fn(),
      removeChildren: vi.fn(),
    }
    const tileSpriteFactory = vi.fn(() => ({ x: 0, y: 0 }))
    const loadRoom = createRoomLoader({
      mapsByKey: { room1: map },
      player,
      mapContainer,
      tileSpriteFactories: { room1: tileSpriteFactory },
      roomState,
    })

    const loaded = loadRoom("room1", "pointA")

    expect(loaded).toBe(true)
    expect(Position.x[player]).toBe(300)
    expect(Position.y[player]).toBe(340)
  })

  it("reports the active map key", () => {
    const map: TiledMap = {
      width: 1,
      height: 1,
      tilewidth: 32,
      tileheight: 32,
      layers: [],
      tilesets: [{ firstgid: 1 }],
    }

    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const roomState = createRoomState()
    const mapContainer = {
      addChild: vi.fn(),
      removeChildren: vi.fn(),
    }
    const tileSpriteFactory = vi.fn(() => ({ x: 0, y: 0 }))
    const loadRoom = createRoomLoader({
      mapsByKey: { room1: map },
      player,
      mapContainer,
      tileSpriteFactories: { room1: tileSpriteFactory },
      roomState,
    })

    expect(loadRoom.getCurrentMapKey()).toBeNull()

    loadRoom("room1")

    expect(loadRoom.getCurrentMapKey()).toBe("room1")

    loadRoom.unloadRoom()

    expect(loadRoom.getCurrentMapKey()).toBeNull()
  })

  it("unloads room state and allows reloading the same map", () => {
    const map: TiledMap = {
      width: 1,
      height: 1,
      tilewidth: 32,
      tileheight: 32,
      layers: [
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

    const fallbackInteraction = {
      x: 8,
      y: 12,
      radius: 10,
      offsetY: 16,
      bounds: { x: 4, y: 6, width: 8, height: 8 },
    }
    const fallbackWalls = [{ x: 1, y: 2, width: 3, height: 4 }]

    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const roomState = createRoomState()
    const mapContainer = {
      addChild: vi.fn(),
      removeChildren: vi.fn(),
    }
    const tileSpriteFactory = vi.fn(() => ({ x: 0, y: 0 }))
    const loadRoom = createRoomLoader({
      mapsByKey: { room1: map },
      player,
      mapContainer,
      tileSpriteFactories: { room1: tileSpriteFactory },
      roomState,
      fallbackInteractionPoint: fallbackInteraction,
      fallbackCollisionWalls: fallbackWalls,
    })

    const loaded = loadRoom("room1")
    expect(loaded).toBe(true)

    loadRoom.unloadRoom()

    expect(roomState.collisionWalls).toEqual(fallbackWalls)
    expect(roomState.teleportState.zones).toEqual([])
    expect(roomState.interactionPoint).toEqual(fallbackInteraction)
    expect(mapContainer.removeChildren).toHaveBeenCalledTimes(2)

    const loadedAgain = loadRoom("room1")
    expect(loadedAgain).toBe(true)
  })

  it("unloads before loading a different map", () => {
    const mapOne: TiledMap = {
      width: 1,
      height: 1,
      tilewidth: 32,
      tileheight: 32,
      layers: [
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
    const mapTwo: TiledMap = {
      width: 1,
      height: 1,
      tilewidth: 32,
      tileheight: 32,
      layers: [
        {
          type: "objectgroup",
          name: "objects",
          objects: [
            {
              id: 1,
              name: "player_spawn",
              x: 10,
              y: 20,
              width: 0,
              height: 0,
            },
            {
              id: 2,
              x: 5,
              y: 6,
              width: 7,
              height: 8,
              properties: [{ name: "collision", type: "bool", value: true }],
            },
          ],
        },
      ],
      tilesets: [{ firstgid: 1 }],
    }

    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 0, y: 0 })
    const roomState = createRoomState()
    const mapContainer = {
      addChild: vi.fn(),
      removeChildren: vi.fn(),
    }
    const tileSpriteFactory = vi.fn(() => ({ x: 0, y: 0 }))
    const loadRoom = createRoomLoader({
      mapsByKey: { room1: mapOne, room2: mapTwo },
      player,
      mapContainer,
      tileSpriteFactories: {
        room1: tileSpriteFactory,
        room2: tileSpriteFactory,
      },
      roomState,
    })

    const unloadSpy = vi.spyOn(loadRoom, "unloadRoom")

    expect(loadRoom("room1")).toBe(true)
    expect(loadRoom("room2")).toBe(true)

    expect(roomState.collisionWalls).toEqual([
      { x: 5, y: 6, width: 7, height: 8 },
    ])
    expect(unloadSpy).toHaveBeenCalledTimes(1)
  })
})
