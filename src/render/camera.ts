import { Position } from "@/src/ecs/components"
import type { GameWorld } from "@/src/ecs/world"
import type { Application, Container } from "pixi.js"

export type CameraLike = {
  setPosition: (x: number, y: number) => void
}

export const createCameraAdapter = (
  app: Application,
  container: Container,
): CameraLike => ({
  setPosition: (x, y) => {
    container.pivot.x = x
    container.pivot.y = y
    container.position.x = app.screen.width / 2
    container.position.y = app.screen.height / 2
  },
})

export const createCameraFollowSystem =
  (player: number, camera: CameraLike) => (_world: GameWorld, _dt: number) => {
    void _world
    void _dt
    camera.setPosition(Position.x[player], Position.y[player])
  }
