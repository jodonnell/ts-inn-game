import { Velocity } from "@/src/ecs/components"
import type { GameWorld } from "@/src/ecs/world"
import { Position } from "@/src/ecs/components"

export type InputState = {
  getMovement: () => { x: number; y: number }
  update?: () => void
}

export type CollisionWall = {
  x: number
  y: number
  width: number
  height: number
}

const PLAYER_COLLISION_BUFFER = 16

const overlapsWall = (x: number, y: number, wall: CollisionWall) =>
  x + PLAYER_COLLISION_BUFFER >= wall.x &&
  x - PLAYER_COLLISION_BUFFER <= wall.x + wall.width &&
  y + PLAYER_COLLISION_BUFFER >= wall.y &&
  y - PLAYER_COLLISION_BUFFER <= wall.y + wall.height

const hitsWall = (x: number, y: number, walls: CollisionWall[]) =>
  walls.some((wall) => overlapsWall(x, y, wall))

export const createInputSystem =
  (player: number, input: InputState, speed = 120) =>
  (_world: GameWorld, _dt: number) => {
    void _world
    void _dt
    input.update?.()
    const { x, y } = input.getMovement()
    const length = Math.hypot(x, y)
    if (length > 0) {
      Velocity.x[player] = (x / length) * speed
      Velocity.y[player] = (y / length) * speed
      return
    }

    Velocity.x[player] = 0
    Velocity.y[player] = 0
  }

export const createMovementSystem =
  (player: number, walls: CollisionWall[] = []) =>
  (_world: GameWorld, dt: number) => {
    void _world
    const currentX = Position.x[player]
    const currentY = Position.y[player]
    const nextX = currentX + Velocity.x[player] * dt
    const nextY = currentY + Velocity.y[player] * dt

    let resolvedX = currentX
    let resolvedY = currentY

    if (!hitsWall(nextX, currentY, walls)) {
      resolvedX = nextX
    }

    if (!hitsWall(resolvedX, nextY, walls)) {
      resolvedY = nextY
    }

    Position.x[player] = resolvedX
    Position.y[player] = resolvedY
  }
