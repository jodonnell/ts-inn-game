import { describe, expect, it } from "vitest"
import { createGameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import { Position } from "@/src/ecs/components"
import {
  createCameraAdapter,
  createCameraFollowSystem,
} from "@/src/render/camera"

describe("camera", () => {
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

  it("clamps the camera to the map bounds using the safe-frame size", () => {
    const container = {
      pivot: { x: 0, y: 0 },
      position: { x: 0, y: 0 },
    }
    const camera = createCameraAdapter(
      { width: 640, height: 360 },
      container as never,
    )

    camera.setBounds({ x: 0, y: 0, width: 1280, height: 720 })

    camera.setPosition(100, 80)
    expect(container.pivot).toEqual({ x: 320, y: 180 })

    camera.setPosition(1200, 700)
    expect(container.pivot).toEqual({ x: 960, y: 540 })
    expect(camera.getVisibleRect()).toEqual({
      x: 640,
      y: 360,
      width: 640,
      height: 360,
    })
  })

  it("keeps small maps fully visible instead of drifting the viewport", () => {
    const container = {
      pivot: { x: 0, y: 0 },
      position: { x: 0, y: 0 },
    }
    const camera = createCameraAdapter(
      { width: 640, height: 360 },
      container as never,
    )

    camera.setBounds({ x: 0, y: 0, width: 320, height: 180 })
    camera.setPosition(999, 999)

    expect(container.pivot).toEqual({ x: 160, y: 90 })
    expect(camera.getVisibleRect()).toEqual({
      x: 0,
      y: 0,
      width: 640,
      height: 360,
    })
    expect(
      camera.isRectVisible({ x: 300, y: 170, width: 20, height: 20 }),
    ).toBe(true)
    expect(
      camera.isRectVisible({ x: 700, y: 400, width: 20, height: 20 }),
    ).toBe(false)
  })

  it("follows the player through the same camera contract", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 12, y: 34 })
    const container = {
      pivot: { x: 0, y: 0 },
      position: { x: 0, y: 0 },
    }
    const camera = createCameraAdapter(
      { width: 640, height: 360 },
      container as never,
    )
    camera.setBounds({ x: 0, y: 0, width: 1280, height: 720 })

    const system = createCameraFollowSystem(player, camera)
    system(world, 0)

    expect(camera.getVisibleRect()).toEqual({
      x: 0,
      y: 0,
      width: 640,
      height: 360,
    })
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
