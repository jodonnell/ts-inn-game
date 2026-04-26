import type { GameWorld } from "@/src/ecs/world"
import type { RoomState } from "@/src/game/roomState"
import {
  getManagerAnimationFrames,
  selectManagerAnimationState,
  type ManagerDirection,
} from "@/src/render/managerAnimation"
import type { SpriteLike } from "@/src/render/playerRender"

export type NpcRenderStore = {
  sprites: Map<string, SpriteLike>
  createAnimatedSprite: (frames: string[]) => SpriteLike
  addSprite: (sprite: SpriteLike) => void
  removeSprite: (sprite: SpriteLike) => void
}

export const createNpcRenderSystem = (
  roomState: RoomState,
  store: NpcRenderStore,
) => {
  const lastPositions = new Map<string, { x: number; y: number }>()
  const lastDirections = new Map<string, ManagerDirection>()
  const lastAnimationKeys = new Map<string, string>()

  return (world: GameWorld, _dt: number) => {
    void world
    void _dt

    const currentNpcIds = new Set(roomState.npcs.map((npc) => npc.id))
    for (const [npcId, sprite] of store.sprites) {
      if (!currentNpcIds.has(npcId)) {
        store.removeSprite(sprite)
        store.sprites.delete(npcId)
        lastPositions.delete(npcId)
        lastDirections.delete(npcId)
        lastAnimationKeys.delete(npcId)
      }
    }

    for (const npc of roomState.npcs) {
      let sprite = store.sprites.get(npc.id)
      const previousPosition = lastPositions.get(npc.id)
      const velocity = previousPosition
        ? {
            x: npc.x - previousPosition.x,
            y: npc.y - previousPosition.y,
          }
        : { x: 0, y: 0 }
      const animationState = selectManagerAnimationState(
        velocity,
        lastDirections.get(npc.id) ?? "front",
      )
      lastDirections.set(npc.id, animationState.direction)
      const nextFrames = getManagerAnimationFrames(animationState)
      const nextAnimationKey = `${animationState.action}-${animationState.direction}`

      if (!sprite) {
        sprite = store.createAnimatedSprite(nextFrames)
        store.sprites.set(npc.id, sprite)
        store.addSprite(sprite)
        lastAnimationKeys.set(npc.id, nextAnimationKey)
      } else if (lastAnimationKeys.get(npc.id) !== nextAnimationKey) {
        sprite.setFrames(nextFrames)
        lastAnimationKeys.set(npc.id, nextAnimationKey)
      }

      if (animationState.action === "walk") {
        sprite.play()
      } else {
        sprite.stop()
      }

      sprite.x = npc.x
      sprite.y = npc.y
      sprite.zIndex = npc.y
      lastPositions.set(npc.id, { x: npc.x, y: npc.y })
    }
  }
}
