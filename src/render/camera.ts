import { Position } from "@/src/ecs/components"
import type { GameWorld } from "@/src/ecs/world"

export type CameraLike = {
  setPosition: (x: number, y: number) => void
}

export const createCameraFollowSystem =
  (player: number, camera: CameraLike) => (_world: GameWorld, _dt: number) => {
    void _world
    void _dt
    camera.setPosition(Position.x[player], Position.y[player])
  }
