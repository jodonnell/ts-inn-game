import { Position, Velocity } from "@/src/ecs/components"
import type { GameWorld } from "@/src/ecs/world"
import {
  getManagerAnimationFrames,
  selectManagerAnimationState,
  type ManagerDirection,
} from "@/src/render/managerAnimation"

export type SpriteLike = {
  x: number
  y: number
  play: () => void
  stop: () => void
  setFrames: (frames: string[]) => void
}

export type RenderStore = {
  sprites: Map<number, SpriteLike>
  createAnimatedSprite: (frames: string[]) => SpriteLike
  addSprite: (sprite: SpriteLike) => void
}

export const createPlayerRenderSystem = (
  player: number,
  store: RenderStore,
) => {
  let lastDirection: ManagerDirection = "front"
  let lastAnimationKey: string | null = null

  return (world: GameWorld, _dt: number) => {
    void world
    void _dt

    let sprite = store.sprites.get(player)
    const animationState = selectManagerAnimationState(
      { x: Velocity.x[player], y: Velocity.y[player] },
      lastDirection,
    )
    lastDirection = animationState.direction
    const nextFrames = getManagerAnimationFrames(animationState)
    const nextAnimationKey = `${animationState.action}-${animationState.direction}`

    if (!sprite) {
      sprite = store.createAnimatedSprite(nextFrames)
      store.sprites.set(player, sprite)
      store.addSprite(sprite)
      lastAnimationKey = nextAnimationKey
    } else if (lastAnimationKey !== nextAnimationKey) {
      sprite.setFrames(nextFrames)
      lastAnimationKey = nextAnimationKey
    }

    if (animationState.action === "walk") {
      sprite.play()
    } else {
      sprite.stop()
    }

    sprite.x = Position.x[player]
    sprite.y = Position.y[player]
  }
}
