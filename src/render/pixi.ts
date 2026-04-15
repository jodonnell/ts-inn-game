import {
  AnimatedSprite,
  Application,
  Assets,
  Container,
  Sprite,
  Spritesheet,
  Texture,
} from "pixi.js"
import type { SpritesheetData } from "pixi.js"
import managerSheetData from "@/assets/spritesheets/manager-sheet.json"
import type { RenderStore, SpriteLike } from "@/src/render/playerRender"
import type { TiledTilesetRef } from "@/src/maps/tiled"
import { parseTilesetImageSource } from "@/src/maps/tiled"
import type { TilesetTexture } from "@/src/render/tilemap"

const base = import.meta.env.DEV ? "../.." : "."
const spritesheetData = managerSheetData as SpritesheetData

export type PixiAppHandle = {
  app: Application
  destroy: () => void
}

export const createPixiApp = async (
  options: { mount?: HTMLElement } = {},
): Promise<PixiAppHandle> => {
  const app = new Application()
  await app.init({ background: "#000000", resizeTo: window })
  const mount = options.mount ?? document.body
  mount.appendChild(app.canvas)

  const destroy = () => {
    app.canvas.remove()
    app.destroy?.()
  }

  return { app, destroy }
}

export const loadManagerSpritesheet = async (): Promise<Spritesheet> => {
  const sheetPath = `${base}/assets/spritesheets/manager-sheet.png`
  await Assets.load(sheetPath)
  const texture = Texture.from(sheetPath)
  const spritesheet = new Spritesheet(texture, spritesheetData)
  await spritesheet.parse()
  return spritesheet
}

const resolvePath = (basePath: string, relativePath: string) => {
  if (
    relativePath.startsWith("http://") ||
    relativePath.startsWith("https://") ||
    relativePath.startsWith("/")
  ) {
    return relativePath
  }
  const base = basePath.replace(/\/+$/, "")
  const combined = `${base}/${relativePath}`
  const parts = combined.split("/")
  const stack: string[] = []
  for (const part of parts) {
    if (part === "" && stack.length === 0) {
      stack.push("")
      continue
    }
    if (part === "" || part === ".") continue
    if (part === "..") {
      if (stack.length > 1 || (stack.length === 1 && stack[0] !== "")) {
        stack.pop()
      }
      continue
    }
    stack.push(part)
  }
  return stack.join("/") || "/"
}

const dirname = (path: string) => {
  const lastSlash = path.lastIndexOf("/")
  if (lastSlash <= 0) return ""
  return path.slice(0, lastSlash)
}

const withRawQuery = (path: string) => {
  if (path.includes("?")) return `${path}&raw`
  return `${path}?raw`
}

export const loadTilesetTextures = async ({
  tilesets,
  tilesetBasePath,
}: {
  tilesets: TiledTilesetRef[]
  tilesetBasePath: string
}): Promise<TilesetTexture[]> => {
  const textures: TilesetTexture[] = []
  for (const tileset of tilesets) {
    if (!tileset.source) continue
    const tsxPath = resolvePath(tilesetBasePath, tileset.source)
    const response = await fetch(withRawQuery(tsxPath))
    const xml = await response.text()
    const imageSource = parseTilesetImageSource(xml)
    if (!imageSource) continue
    const imagePath = resolvePath(dirname(tsxPath), imageSource)
    await Assets.load(imagePath)
    textures.push({
      firstgid: tileset.firstgid,
      texture: Texture.from(imagePath),
    })
  }
  return textures
}

export const createPixiRenderStore = (
  app: Application,
  spritesheet: Spritesheet,
  container: Container,
): RenderStore => {
  const sprites = new Map<number, SpriteLike>()
  const getTexture = (frame: string): Texture => {
    const texture = spritesheet.textures[frame]
    if (!texture) {
      throw new Error(`Missing sprite frame: ${frame}`)
    }
    return texture
  }

  return {
    sprites,
    createAnimatedSprite: (frames) => {
      const textures = frames.map(getTexture)
      const sprite = new AnimatedSprite(textures) as AnimatedSprite & SpriteLike
      sprite.anchor.set(0.5, 1)
      sprite.animationSpeed = 0.15
      sprite.setFrames = (nextFrames) => {
        sprite.textures = nextFrames.map(getTexture)
      }
      return sprite
    },
    addSprite: (sprite) => {
      container.addChild(sprite as Sprite)
    },
  }
}
