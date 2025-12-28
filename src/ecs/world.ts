import { addComponent, addEntity, createWorld } from "bitecs"
import { Position } from "@/src/ecs/components"

export type GameWorld = ReturnType<typeof createWorld>

export const createGameWorld = (): GameWorld => {
  return createWorld()
}

export const spawnPlayer = (
  world: GameWorld,
  position: { x: number; y: number },
): number => {
  const entity = addEntity(world)
  addComponent(world, Position, entity)
  Position.x[entity] = position.x
  Position.y[entity] = position.y
  return entity
}
