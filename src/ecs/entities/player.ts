import { addComponent, addEntity } from "bitecs"
import { Position, Velocity } from "@/src/ecs/components"
import type { GameWorld } from "@/src/ecs/world"

export const spawnPlayer = (
  world: GameWorld,
  position: { x: number; y: number },
): number => {
  const entity = addEntity(world)
  addComponent(world, Position, entity)
  addComponent(world, Velocity, entity)
  Position.x[entity] = position.x
  Position.y[entity] = position.y
  Velocity.x[entity] = 0
  Velocity.y[entity] = 0
  return entity
}
