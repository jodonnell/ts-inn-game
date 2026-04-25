import { describe, expect, it, vi } from "vitest"
import { createGameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import { Position, Velocity } from "@/src/ecs/components"
import { createPlayerRenderSystem } from "@/src/render/playerRender"

describe("player render system", () => {
  it("creates and updates the manager animation while syncing position", () => {
    const world = createGameWorld()
    const player = spawnPlayer(world, { x: 10, y: 20 })
    const sprites = new Map<number, { x: number; y: number }>()
    const createdFrames: string[][] = []
    const updatedFrames: string[][] = []
    const play = vi.fn()
    const stop = vi.fn()
    const addSprite = vi.fn()

    const system = createPlayerRenderSystem(player, {
      sprites,
      createAnimatedSprite: (frames) => {
        createdFrames.push(frames)
        return {
          x: 0,
          y: 0,
          play,
          stop,
          setFrames: (nextFrames) => {
            updatedFrames.push(nextFrames)
          },
        }
      },
      addSprite,
    })

    system(world, 0)

    expect(createdFrames).toEqual([
      ["0001-manager-all-frames_frontidle_0001.png"],
    ])
    expect(addSprite).toHaveBeenCalledTimes(1)
    expect(sprites.get(player)).toEqual(
      expect.objectContaining({ x: 10, y: 20, zIndex: 20 }),
    )
    expect(stop).toHaveBeenCalledTimes(1)
    expect(play).not.toHaveBeenCalled()

    Velocity.x[player] = 120
    Velocity.y[player] = 0
    system(world, 0.016)

    expect(updatedFrames).toEqual([
      [
        "0018-manager-all-frames_rightwalk_0001.png",
        "0019-manager-all-frames_rightwalk_0002.png",
        "0020-manager-all-frames_rightwalk_0003.png",
        "0021-manager-all-frames_rightwalk_0004.png",
      ],
    ])
    expect(play).toHaveBeenCalledTimes(1)

    Position.x[player] = 99
    Position.y[player] = 101
    Velocity.x[player] = 0
    Velocity.y[player] = 0

    system(world, 0.016)

    expect(createdFrames).toEqual([
      ["0001-manager-all-frames_frontidle_0001.png"],
    ])
    expect(addSprite).toHaveBeenCalledTimes(1)
    expect(sprites.get(player)).toEqual(
      expect.objectContaining({ x: 99, y: 101, zIndex: 101 }),
    )
    expect(updatedFrames).toEqual([
      [
        "0018-manager-all-frames_rightwalk_0001.png",
        "0019-manager-all-frames_rightwalk_0002.png",
        "0020-manager-all-frames_rightwalk_0003.png",
        "0021-manager-all-frames_rightwalk_0004.png",
      ],
      ["0017-manager-all-frames_rightidle_0001.png"],
    ])
    expect(stop).toHaveBeenCalledTimes(2)
  })
})
