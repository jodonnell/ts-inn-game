// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest"
import {
  createPixiApp,
  createPixiRenderStore,
  createSafeFrameLayout,
  createTilesetTextLoader,
  loadFixtureTextures,
  loadTilesetTextures,
} from "@/src/render/pixi"

const assetsLoad = vi.hoisted(() => vi.fn(async () => {}))
const textureFrom = vi.hoisted(() =>
  vi.fn((path: string) => ({ path, source: { path } })),
)

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
    stage = { addChild: vi.fn() }
    init = vi.fn(async () => {})
    destroy = vi.fn()
  }
  class Container {
    x = 0
    y = 0
    scale = { x: 1, y: 1 }
  }
  class Rectangle {
    constructor(
      public x: number,
      public y: number,
      public width: number,
      public height: number,
    ) {}
  }
  class Texture {
    static from = textureFrom

    constructor(public options: unknown) {}
  }
  return {
    Application,
    AnimatedSprite,
    Assets: { load: assetsLoad },
    Container,
    Rectangle,
    SCALE_MODES: { NEAREST: "nearest" },
    Sprite,
    Texture,
    TextureStyle: { defaultOptions: { scaleMode: "linear" } },
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

  it("recomputes the safe frame when the window is resized", async () => {
    const originalInnerWidth = window.innerWidth
    const originalInnerHeight = window.innerHeight
    window.innerWidth = 1024
    window.innerHeight = 768

    const { safeFrame, safeFrameLayout, destroy } = await createPixiApp()

    expect(safeFrameLayout.frame).toEqual({
      width: 640,
      height: 360,
      scale: 1,
      offsetX: 192,
      offsetY: 204,
    })

    window.innerWidth = 1920
    window.innerHeight = 1080
    window.dispatchEvent(new Event("resize"))

    expect(safeFrameLayout.frame).toEqual({
      width: 640,
      height: 360,
      scale: 3,
      offsetX: 0,
      offsetY: 0,
    })
    expect(safeFrame.scale).toEqual({ x: 3, y: 3 })
    expect(safeFrame.x).toBe(0)
    expect(safeFrame.y).toBe(0)

    destroy()
    window.innerWidth = originalInnerWidth
    window.innerHeight = originalInnerHeight
  })

  it("lays out a 640x360 safe frame with integer scaling and letterboxing", () => {
    const container = {
      x: 0,
      y: 0,
      scale: { x: 1, y: 1 },
    }

    const layout = createSafeFrameLayout(container as never)
    layout.resize({ width: 1920, height: 1080 })

    expect(layout.frame).toEqual({
      width: 640,
      height: 360,
      scale: 3,
      offsetX: 0,
      offsetY: 0,
    })
    expect(container.scale).toEqual({ x: 3, y: 3 })
    expect(container.x).toBe(0)
    expect(container.y).toBe(0)

    layout.resize({ width: 1024, height: 768 })

    expect(layout.frame).toEqual({
      width: 640,
      height: 360,
      scale: 1,
      offsetX: 192,
      offsetY: 204,
    })
    expect(container.scale).toEqual({ x: 1, y: 1 })
    expect(container.x).toBe(192)
    expect(container.y).toBe(204)
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
      {
        firstgid: 1,
        texture: {
          path: "/assets/maps/tiles.png",
          source: { path: "/assets/maps/tiles.png" },
        },
      },
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

  it("preloads fixture texture sources before fixture sprites are created", async () => {
    await loadFixtureTextures(["bathroom-tileset"])

    expect(assetsLoad).toHaveBeenCalledWith("bathroom-tileset")
  })

  it("creates fixture sprites that can swap assets", () => {
    const addChild = vi.fn()
    const removeChild = vi.fn()
    const store = createPixiRenderStore(
      {} as never,
      { textures: {} } as never,
      { addChild, removeChild } as never,
    )

    const sprite = store.fixtureStore.createSprite({
      source: "bathroom-tileset",
      frame: { x: 0, y: 96, width: 64, height: 64 },
    })
    store.fixtureStore.sprites.set("bed-1", sprite)
    store.fixtureStore.addSprite(sprite)

    expect(textureFrom).toHaveBeenCalledWith("bathroom-tileset")
    expect(addChild).toHaveBeenCalledWith(sprite)
    expect(sprite.assetKey).toBe("bathroom-tileset:0,96,64,64")
    expect(sprite.texture).toEqual(
      expect.objectContaining({
        options: {
          source: { path: "bathroom-tileset" },
          frame: { x: 0, y: 96, width: 64, height: 64 },
        },
      }),
    )

    sprite.setAsset({
      source: "bathroom-tileset",
      frame: { x: 64, y: 96, width: 64, height: 64 },
    })

    expect(sprite.texture).toEqual(
      expect.objectContaining({
        options: {
          source: { path: "bathroom-tileset" },
          frame: { x: 64, y: 96, width: 64, height: 64 },
        },
      }),
    )

    store.fixtureStore.removeSprite(sprite)

    expect(removeChild).toHaveBeenCalledWith(sprite)
  })

  it("enables depth sorting on the actor container", () => {
    const container = {
      addChild: vi.fn(),
      sortableChildren: false,
    }

    createPixiRenderStore({} as never, { textures: {} } as never, container)

    expect(container.sortableChildren).toBe(true)
  })

  it("removes npc sprites from the actor container", () => {
    const container = {
      addChild: vi.fn(),
      removeChild: vi.fn(),
    }
    const store = createPixiRenderStore(
      {} as never,
      { textures: {} } as never,
      container as never,
    )
    const sprite = {
      x: 0,
      y: 0,
      play: vi.fn(),
      stop: vi.fn(),
      setFrames: vi.fn(),
    }

    store.npcStore.removeSprite(sprite)

    expect(container.removeChild).toHaveBeenCalledWith(sprite)
  })
})
