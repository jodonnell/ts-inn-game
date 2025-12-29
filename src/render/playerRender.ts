import { Position } from "@/src/ecs/components"
import type { GameWorld } from "@/src/ecs/world"

export const MANAGER_SPRITE_FRAME = "0001-manager-all-frames_frontidle_0001.png"

export type SpriteLike = {
  x: number
  y: number
}

export type RenderStore = {
  sprites: Map<number, SpriteLike>
  createSprite: (frame: string) => SpriteLike
  addSprite: (sprite: SpriteLike) => void
}

export const createPlayerRenderSystem =
  (player: number, store: RenderStore) => (world: GameWorld, _dt: number) => {
    void world
    void _dt
    let sprite = store.sprites.get(player)
    if (!sprite) {
      sprite = store.createSprite(MANAGER_SPRITE_FRAME)
      store.sprites.set(player, sprite)
      store.addSprite(sprite)
    }

    sprite.x = Position.x[player]
    sprite.y = Position.y[player]
  }
