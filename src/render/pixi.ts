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

export const loadTileSheetTexture = async (): Promise<Texture> => {
  const sheetPath = `${base}/assets/spritesheets/tile-sheet.png`
  await Assets.load(sheetPath)
  return Texture.from(sheetPath)
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
