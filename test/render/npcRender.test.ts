import { describe, expect, it, vi } from "vitest"
import { createGameWorld } from "@/src/ecs/world"
import { createRoomState } from "@/src/game/roomState"
import { createNpcRenderSystem } from "@/src/render/npcRender"

describe("npc render system", () => {
  it("creates a stopped manager animation for room npcs", () => {
    const world = createGameWorld()
    const roomState = createRoomState()
    roomState.replaceNpcs([
      {
        id: "manager",
        name: "Manager",
        x: 352,
        y: 192,
        width: 32,
        height: 32,
      },
    ])
    const sprites = new Map<string, { x: number; y: number }>()
    const createdFrames: string[][] = []
    const addSprite = vi.fn()
    const stop = vi.fn()

    const system = createNpcRenderSystem(roomState, {
      sprites,
      createAnimatedSprite: (frames) => {
        createdFrames.push(frames)
        return {
          x: 0,
          y: 0,
          play: vi.fn(),
          stop,
          setFrames: vi.fn(),
        }
      },
      addSprite,
    })

    system(world, 0)

    expect(createdFrames).toEqual([
      ["0001-manager-all-frames_frontidle_0001.png"],
    ])
    expect(addSprite).toHaveBeenCalledTimes(1)
    expect(stop).toHaveBeenCalledTimes(1)
    expect(sprites.get("manager")).toEqual(
      expect.objectContaining({ x: 352, y: 192 }),
    )
  })
})
