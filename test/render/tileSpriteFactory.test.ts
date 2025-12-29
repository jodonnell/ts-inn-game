import { describe, expect, it, vi } from "vitest"
import { createPixiTileSpriteFactory } from "@/src/render/tilemap"

const createdTextures: Array<{ source?: unknown; frame?: unknown }> = []

vi.mock("pixi.js", () => {
  class Rectangle {
    x: number
    y: number
    width: number
    height: number
    constructor(x: number, y: number, width: number, height: number) {
      this.x = x
      this.y = y
      this.width = width
      this.height = height
    }
  }
  class Texture {
    source?: unknown
    frame?: Rectangle
    constructor(options?: { source?: unknown; frame?: Rectangle }) {
      this.source = options?.source
      this.frame = options?.frame
      createdTextures.push({ source: this.source, frame: this.frame })
    }
  }
  class Sprite {
    texture: Texture
    constructor(texture: Texture) {
      this.texture = texture
    }
  }
  return { Rectangle, Texture, Sprite }
})

describe("tile sprite factory", () => {
  it("builds textures from the base texture with the expected tile frame", () => {
    const baseTexture = { id: "base" }
    const tilesetTexture = { width: 64, baseTexture } as unknown as {
      width: number
      baseTexture: unknown
    }

    const factory = createPixiTileSpriteFactory(tilesetTexture as never, 16, 16)
    factory(5)

    expect(createdTextures).toHaveLength(1)
    const { source, frame } = createdTextures[0]
    expect(source).toBe(baseTexture)
    expect(frame).toEqual({ x: 16, y: 16, width: 16, height: 16 })
  })
})
