import { Velocity } from "@/src/ecs/components"
import type { GameWorld } from "@/src/ecs/world"
import { Position } from "@/src/ecs/components"

export type InputState = {
  getMovement: () => { x: number; y: number }
}

export const createInputSystem =
  (player: number, input: InputState, speed = 120) =>
  (_world: GameWorld, _dt: number) => {
    void _world
    void _dt
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
  (player: number) => (_world: GameWorld, dt: number) => {
    void _world
    Position.x[player] += Velocity.x[player] * dt
    Position.y[player] += Velocity.y[player] * dt
  }
