import { describe, expect, it, vi } from "vitest"
import { createGameWorld, spawnPlayer } from "@/src/ecs/world"
import { Position } from "@/src/ecs/components"
import {
  MANAGER_SPRITE_FRAME,
  createPlayerRenderSystem,
} from "@/src/render/playerRender"

describe("player render system", () => {
  it("creates a manager sprite once and syncs position", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 10, y: 20 })
    const sprites = new Map<number, { x: number; y: number }>()
    const createdFrames: string[] = []
    const addSprite = vi.fn()

    const system = createPlayerRenderSystem(player, {
      sprites,
      createSprite: (frame) => {
        createdFrames.push(frame)
        return { x: 0, y: 0 }
      },
      addSprite,
    })

    system(world, 0)

    expect(createdFrames).toEqual([MANAGER_SPRITE_FRAME])
    expect(addSprite).toHaveBeenCalledTimes(1)
    expect(sprites.get(player)).toEqual({ x: 10, y: 20 })

    Position.x[player] = 99
    Position.y[player] = 101

    system(world, 0.016)

    expect(createdFrames).toEqual([MANAGER_SPRITE_FRAME])
    expect(addSprite).toHaveBeenCalledTimes(1)
    expect(sprites.get(player)).toEqual({ x: 99, y: 101 })
  })
})
