import { describe, expect, it } from "vitest"
import { renderTileLayer } from "@/src/render/tilemap"
import type { TiledTileLayer } from "@/src/maps/tiled"

describe("tilemap renderer", () => {
  it("renders non-empty tiles with correct positions", () => {
    const layer: TiledTileLayer = {
      type: "tilelayer",
      name: "ground",
      width: 2,
      height: 2,
      data: [1, 0, 2, 3],
    }
    const created: Array<{ x: number; y: number; tileId: number }> = []
    const addSprite = (sprite: { x: number; y: number; tileId: number }) => {
      created.push(sprite)
    }
    const createSprite = (tileId: number) => ({ x: 0, y: 0, tileId })

    renderTileLayer(layer, 16, 16, 1, createSprite, addSprite)

    expect(created).toEqual([
      { x: 0, y: 0, tileId: 0 },
      { x: 0, y: 16, tileId: 1 },
      { x: 16, y: 16, tileId: 2 },
    ])
  })
})
