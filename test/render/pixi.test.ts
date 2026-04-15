// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest"
import { createPixiApp, loadTilesetTextures } from "@/src/render/pixi"

const assetsLoad = vi.hoisted(() => vi.fn(async () => {}))
const textureFrom = vi.hoisted(() => vi.fn((path: string) => ({ path })))

vi.mock("pixi.js", () => {
  class Application {
    canvas = document.createElement("canvas")
    init = vi.fn(async () => {})
    destroy = vi.fn()
  }
  return {
    Application,
    Assets: { load: assetsLoad },
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
    const xml = '<tileset><image source="tiles.png"/></tileset>'
    const fetchMock = vi.fn(async () => ({
      text: async () => xml,
    }))
    globalThis.fetch = fetchMock as typeof fetch

    const tilesets = [{ firstgid: 1, source: "tiles.tsx" }]
    const textures = await loadTilesetTextures({
      tilesets,
      tilesetBasePath: "/assets/maps",
    })

    expect(fetchMock).toHaveBeenCalledWith("/assets/maps/tiles.tsx?raw")
    expect(assetsLoad).toHaveBeenCalledWith("/assets/maps/tiles.png")
    expect(textureFrom).toHaveBeenCalledWith("/assets/maps/tiles.png")
    expect(textures).toEqual([
      { firstgid: 1, texture: { path: "/assets/maps/tiles.png" } },
    ])
  })

  it("resolves tileset images relative to the tsx location", async () => {
    const xml =
      '<tileset><image source="../spritesheets/tile-sheet.png"/></tileset>'
    const fetchMock = vi.fn(async () => ({
      text: async () => xml,
    }))
    globalThis.fetch = fetchMock as typeof fetch

    const tilesets = [{ firstgid: 1, source: "tile-sheet.tsx" }]
    await loadTilesetTextures({
      tilesets,
      tilesetBasePath: "/assets/maps",
    })

    expect(fetchMock).toHaveBeenCalledWith("/assets/maps/tile-sheet.tsx?raw")
    expect(assetsLoad).toHaveBeenCalledWith(
      "/assets/spritesheets/tile-sheet.png",
    )
    expect(textureFrom).toHaveBeenCalledWith(
      "/assets/spritesheets/tile-sheet.png",
    )
  })
})
