import { describe, expect, it } from "vitest"
import { createGameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import { Position } from "@/src/ecs/components"
import {
  createCameraAdapter,
  createCameraFollowSystem,
} from "@/src/render/camera"

describe("camera follow system", () => {
  it("centers the world using the safe-frame viewport", () => {
    const container = {
      pivot: { x: 0, y: 0 },
      position: { x: 0, y: 0 },
    }
    const camera = createCameraAdapter(
      { width: 640, height: 360 },
      container as never,
    )

    camera.setPosition(120, 80)

    expect(container.pivot).toEqual({ x: 120, y: 80 })
    expect(container.position).toEqual({ x: 320, y: 180 })
  })

  it("updates camera position to follow the player", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 12, y: 34 })
    const calls: Array<{ x: number; y: number }> = []
    const camera = {
      setPosition: (x: number, y: number) => {
        calls.push({ x, y })
      },
    }

    const system = createCameraFollowSystem(player, camera)
    system(world, 0)

    expect(calls).toEqual([{ x: 12, y: 34 }])

    Position.x[player] = -10
    Position.y[player] = 4

    system(world, 0.016)

    expect(calls).toEqual([
      { x: 12, y: 34 },
      { x: -10, y: 4 },
    ])
  })
})
