import type { TiledMap } from "@/src/maps/tiled"
import {
  createEmptyRoomMap,
  withInteraction,
  withSpawn,
  withTeleport,
} from "@/src/test-fixtures/emptyRoomMap"

const createInteractionFixtureMaps = (): Record<string, TiledMap> => ({
  inn: createEmptyRoomMap(),
  room1: createEmptyRoomMap(),
  tiledRoom: withInteraction(
    withSpawn(createEmptyRoomMap(), { id: "player_spawn", x: 32, y: 32 }),
    {
      id: "bell",
      x: 48,
      y: 32,
      width: 96,
      height: 32,
    },
  ),
})

const createTeleportFixtureMaps = (): Record<string, TiledMap> => ({
  inn: withSpawn(createEmptyRoomMap(), { id: "pointA", x: 224, y: 96 }),
  room1: createEmptyRoomMap(),
  tiledRoom: withTeleport(
    withSpawn(createEmptyRoomMap(), { id: "player_spawn", x: 32, y: 32 }),
    {
      x: 80,
      y: 16,
      width: 32,
      height: 64,
      targetMapKey: "inn",
      spawnId: "pointA",
    },
  ),
})

const fixtures: Record<string, Record<string, TiledMap>> = {
  interaction: createInteractionFixtureMaps(),
  teleport: createTeleportFixtureMaps(),
}

export const getE2EMapFixture = (name: string) => fixtures[name] ?? null
