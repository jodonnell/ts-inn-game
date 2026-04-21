// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest"
import {
  createPixiApp,
  createPixiRenderStore,
  createTilesetTextLoader,
  loadTilesetTextures,
} from "@/src/render/pixi"

const assetsLoad = vi.hoisted(() => vi.fn(async () => {}))
const textureFrom = vi.hoisted(() => vi.fn((path: string) => ({ path })))

vi.mock("pixi.js", () => {
  class Sprite {
    texture
    x = 0
    y = 0
    anchor = { set: vi.fn() }

    constructor(texture?: unknown) {
      this.texture = texture
    }
  }

  class AnimatedSprite extends Sprite {
    textures
    animationSpeed = 0

    constructor(textures: unknown[]) {
      super(textures[0])
      this.textures = textures
    }
  }

  class Application {
    canvas = document.createElement("canvas")
    init = vi.fn(async () => {})
    destroy = vi.fn()
  }
  return {
    Application,
    AnimatedSprite,
    Assets: { load: assetsLoad },
    Sprite,
    Texture: { from: textureFrom },
  }
})

describe("pixi app", () => {
  it("mounts the canvas into a provided element and can cleanup", async () => {
    const mount = document.createElement("div")
    document.body.appendChild(mount)

    const { app, destroy } = await createPixiApp({ mount })

    expect(mount.querySelector("canvas")).toBe(app.canvas)

    destroy()

    expect(mount.querySelector("canvas")).toBeNull()
  })

  it("loads tileset textures from tsx sources", async () => {
    const tilesets = [{ firstgid: 1, source: "tiles.tsx" }]
    const textures = await loadTilesetTextures({
      tilesets,
      tilesetBasePath: "/assets/maps",
      loadTilesetText: createTilesetTextLoader({
        "/assets/maps/tiles.tsx":
          '<tileset><image source="tiles.png"/></tileset>',
      }),
    })

    expect(assetsLoad).toHaveBeenCalledWith("/assets/maps/tiles.png")
    expect(textureFrom).toHaveBeenCalledWith("/assets/maps/tiles.png")
    expect(textures).toEqual([
      { firstgid: 1, texture: { path: "/assets/maps/tiles.png" } },
    ])
  })

  it("resolves tileset images relative to the tsx location", async () => {
    const tilesets = [{ firstgid: 1, source: "tile-sheet.tsx" }]
    await loadTilesetTextures({
      tilesets,
      tilesetBasePath: "/assets/maps",
      loadTilesetText: createTilesetTextLoader({
        "/assets/maps/tile-sheet.tsx":
          '<tileset><image source="../spritesheets/tile-sheet.png"/></tileset>',
      }),
    })

    expect(assetsLoad).toHaveBeenCalledWith(
      "/assets/spritesheets/tile-sheet.png",
    )
    expect(textureFrom).toHaveBeenCalledWith(
      "/assets/spritesheets/tile-sheet.png",
    )
  })

  it("loads tileset text from a build-time registry", async () => {
    const loadTilesetText = createTilesetTextLoader({
      "/assets/maps/tiles.tsx": "<tileset />",
    })

    await expect(
      loadTilesetText("../../assets/maps", "tiles.tsx"),
    ).resolves.toBe("<tileset />")
  })

  it("returns null when the registry does not contain the resolved tsx path", async () => {
    const loadTilesetText = createTilesetTextLoader({})

    await expect(
      loadTilesetText("/assets/maps", "tiles.tsx"),
    ).resolves.toBeNull()
  })

  it("creates fixture sprites that can swap assets", () => {
    const addChild = vi.fn()
    const store = createPixiRenderStore(
      {} as never,
      { textures: {} } as never,
      { addChild } as never,
    )

    const sprite = store.fixtureStore.createSprite("bed-dirty")
    store.fixtureStore.sprites.set("bed-1", sprite)
    store.fixtureStore.addSprite(sprite)

    expect(textureFrom).toHaveBeenCalledWith("bed-dirty")
    expect(addChild).toHaveBeenCalledWith(sprite)
    expect(sprite.assetId).toBe("bed-dirty")

    sprite.setAsset("bed-clean")

    expect(textureFrom).toHaveBeenCalledWith("bed-clean")
    expect(sprite.texture).toEqual({ path: "bed-clean" })
  })
})
