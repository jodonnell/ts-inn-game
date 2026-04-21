import { describe, expect, it, vi } from "vitest"
import { createGameWorld } from "@/src/ecs/world"
import { createRoomState } from "@/src/game/roomState"
import { createFixtureRenderSystem } from "@/src/render/fixtureRender"

describe("fixture render system", () => {
  it("creates fixture sprites and swaps assets when fixture state changes", () => {
    const world = createGameWorld()
    const roomState = createRoomState()
    const createdAssets: string[] = []
    const updatedAssets: string[] = []
    const addSprite = vi.fn()
    const sprites = new Map<
      string,
      { x: number; y: number; setAsset: (assetId: string) => void }
    >()

    roomState.replaceFixtures([
      {
        id: "bed-1",
        type: "bed",
        x: 160,
        y: 96,
        width: 64,
        height: 32,
        durationMs: 4000,
        state: "dirty",
        progressMs: 0,
      },
    ])

    const system = createFixtureRenderSystem(roomState, {
      sprites,
      createSprite: (assetId) => {
        createdAssets.push(assetId)
        return {
          x: 0,
          y: 0,
          setAsset: (nextAssetId) => {
            updatedAssets.push(nextAssetId)
          },
        }
      },
      addSprite,
    })

    system(world, 0)

    expect(createdAssets).toEqual(["bed-dirty"])
    expect(addSprite).toHaveBeenCalledTimes(1)
    expect(sprites.get("bed-1")).toEqual(
      expect.objectContaining({ x: 160, y: 96 }),
    )

    roomState.fixtures[0].state = "clean"

    system(world, 0.016)

    expect(createdAssets).toEqual(["bed-dirty"])
    expect(updatedAssets).toEqual(["bed-clean"])
  })

  it("does not swap assets again when the fixture state is unchanged", () => {
    const world = createGameWorld()
    const roomState = createRoomState()
    const setAsset = vi.fn()

    roomState.replaceFixtures([
      {
        id: "bed-1",
        type: "bed",
        x: 160,
        y: 96,
        width: 64,
        height: 32,
        durationMs: 4000,
        state: "dirty",
        progressMs: 0,
      },
    ])

    const sprite = { x: 0, y: 0, assetId: "bed-dirty", setAsset }
    const system = createFixtureRenderSystem(roomState, {
      sprites: new Map([["bed-1", sprite]]),
      createSprite: vi.fn(),
      addSprite: vi.fn(),
    })

    system(world, 0)
    system(world, 0.016)

    expect(setAsset).not.toHaveBeenCalled()
  })
})
