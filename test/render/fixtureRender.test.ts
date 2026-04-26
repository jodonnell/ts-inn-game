import { describe, expect, it, vi } from "vitest"
import { createGameWorld } from "@/src/ecs/world"
import { createRoomState } from "@/src/game/roomState"
import type { FixtureAsset } from "@/src/render/fixtureAssets"
import { createFixtureRenderSystem } from "@/src/render/fixtureRender"
import bathroomTileset from "@/assets/spritesheets/bathroom_tileset.png"

const messyBedAsset = {
  source: bathroomTileset,
  frame: { x: 0, y: 96, width: 64, height: 64 },
}
const cleanBedAsset = {
  source: bathroomTileset,
  frame: { x: 64, y: 96, width: 64, height: 64 },
}

describe("fixture render system", () => {
  it("creates fixture sprites and swaps assets when fixture state changes", () => {
    const world = createGameWorld()
    const roomState = createRoomState()
    const createdAssets: FixtureAsset[] = []
    const updatedAssets: FixtureAsset[] = []
    const addSprite = vi.fn()
    const sprites = new Map<
      string,
      { x: number; y: number; setAsset: (asset: FixtureAsset) => void }
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
      createSprite: (asset) => {
        createdAssets.push(asset)
        return {
          x: 0,
          y: 0,
          setAsset: (nextAsset) => {
            updatedAssets.push(nextAsset)
          },
        }
      },
      addSprite,
    })

    system(world, 0)

    expect(createdAssets).toEqual([messyBedAsset])
    expect(addSprite).toHaveBeenCalledTimes(1)
    expect(sprites.get("bed-1")).toEqual(
      expect.objectContaining({ x: 192, y: 128 }),
    )

    roomState.fixtures[0].state = "clean"

    system(world, 0.016)

    expect(createdAssets).toEqual([messyBedAsset])
    expect(updatedAssets).toEqual([cleanBedAsset])
  })

  it("anchors fixture sprites to the bottom center of their Tiled object bounds", () => {
    const world = createGameWorld()
    const roomState = createRoomState()

    roomState.replaceFixtures([
      {
        id: "bed-1",
        type: "bed",
        x: 416,
        y: 224,
        width: 64,
        height: 64,
        durationMs: 4000,
        state: "dirty",
        progressMs: 0,
      },
    ])

    const sprite = {
      x: 0,
      y: 0,
      setAsset: vi.fn(),
    }
    const system = createFixtureRenderSystem(roomState, {
      sprites: new Map(),
      createSprite: vi.fn(() => sprite),
      addSprite: vi.fn(),
    })

    system(world, 0)

    expect(sprite).toEqual(expect.objectContaining({ x: 448, y: 288 }))
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

    const sprite = {
      x: 0,
      y: 0,
      assetKey: `${bathroomTileset}:0,96,64,64`,
      setAsset,
    }
    const system = createFixtureRenderSystem(roomState, {
      sprites: new Map([["bed-1", sprite]]),
      createSprite: vi.fn(),
      addSprite: vi.fn(),
    })

    system(world, 0)
    system(world, 0.016)

    expect(setAsset).not.toHaveBeenCalled()
  })

  it("removes fixture sprites that are no longer in room state", () => {
    const world = createGameWorld()
    const roomState = createRoomState()
    const bedSprite = { x: 0, y: 0, setAsset: vi.fn() }
    const removeSprite = vi.fn()

    const system = createFixtureRenderSystem(roomState, {
      sprites: new Map([["bed-1", bedSprite]]),
      createSprite: vi.fn(),
      addSprite: vi.fn(),
      removeSprite,
    })

    system(world, 0)

    expect(removeSprite).toHaveBeenCalledWith(bedSprite)
  })
})
