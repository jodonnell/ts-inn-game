import { Position } from "@/src/ecs/components"
import type { GameWorld } from "@/src/ecs/world"
import type { Application } from "pixi.js"

export type CameraLike = {
  setPosition: (x: number, y: number) => void
}

export const createCameraAdapter = (app: Application): CameraLike => ({
  setPosition: (x, y) => {
    app.stage.pivot.x = x
    app.stage.pivot.y = y
    app.stage.position.x = app.screen.width / 2
    app.stage.position.y = app.screen.height / 2
  },
})

export const createCameraFollowSystem =
  (player: number, camera: CameraLike) => (_world: GameWorld, _dt: number) => {
    void _world
    void _dt
    camera.setPosition(Position.x[player], Position.y[player])
  }
