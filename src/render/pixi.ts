import {
  Application,
  Assets,
  Sprite,
  Spritesheet,
  Texture,
} from "pixi.js"
import type { SpritesheetData } from "pixi.js"
import managerSheetData from "@/assets/spritesheets/manager-sheet.json"
import type { RenderStore, SpriteLike } from "@/src/render/playerRender"

const base = import.meta.env.DEV ? "../.." : "."
const spritesheetData = managerSheetData as SpritesheetData

export const createPixiApp = async (): Promise<Application> => {
  const app = new Application()
  await app.init({ background: "#000000", resizeTo: window })
  document.body.appendChild(app.canvas)
  return app
}

export const loadManagerSpritesheet = async (): Promise<Spritesheet> => {
  const sheetPath = `${base}/assets/spritesheets/manager-sheet.png`
  await Assets.load(sheetPath)
  const texture = Texture.from(sheetPath)
  const spritesheet = new Spritesheet(texture, spritesheetData)
  await spritesheet.parse()
  return spritesheet
}

export const createPixiRenderStore = (
  app: Application,
  spritesheet: Spritesheet,
): RenderStore => {
  const sprites = new Map<number, SpriteLike>()

  return {
    sprites,
    createSprite: (frame) => {
      const texture = spritesheet.textures[frame]
      if (!texture) {
        throw new Error(`Missing sprite frame: ${frame}`)
      }
      const sprite = new Sprite(texture)
      sprite.anchor.set(0.5, 1)
      return sprite
    },
    addSprite: (sprite) => {
      app.stage.addChild(sprite as Sprite)
    },
  }
}
