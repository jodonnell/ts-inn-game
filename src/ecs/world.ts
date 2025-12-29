import { createWorld } from "bitecs"

export type GameWorld = ReturnType<typeof createWorld>

export const createGameWorld = (): GameWorld => {
  return createWorld()
}
