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
        mapKey: "hallway",
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
      removeSprite: vi.fn(),
    })

    system(world, 0)

    expect(createdFrames).toEqual([
      ["0001-manager-all-frames_frontidle_0001.png"],
    ])
    expect(addSprite).toHaveBeenCalledTimes(1)
    expect(stop).toHaveBeenCalledTimes(1)
    expect(sprites.get("manager")).toEqual(
      expect.objectContaining({ x: 352, y: 192, zIndex: 192 }),
    )
  })

  it("removes npc sprites that are no longer in the current room", () => {
    const world = createGameWorld()
    const roomState = createRoomState()
    const managerSprite = {
      x: 352,
      y: 256,
      zIndex: 256,
      play: vi.fn(),
      stop: vi.fn(),
      setFrames: vi.fn(),
    }
    const sprites = new Map([["manager", managerSprite]])
    const removeSprite = vi.fn()

    const system = createNpcRenderSystem(roomState, {
      sprites,
      createAnimatedSprite: vi.fn(),
      addSprite: vi.fn(),
      removeSprite,
    })

    system(world, 0)

    expect(removeSprite).toHaveBeenCalledWith(managerSprite)
    expect(sprites.has("manager")).toBe(false)
  })
})
