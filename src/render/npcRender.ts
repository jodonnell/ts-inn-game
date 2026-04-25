import type { GameWorld } from "@/src/ecs/world"
import type { RoomState } from "@/src/game/roomState"
import { getManagerAnimationFrames } from "@/src/render/managerAnimation"
import type { SpriteLike } from "@/src/render/playerRender"

export type NpcRenderStore = {
  sprites: Map<string, SpriteLike>
  createAnimatedSprite: (frames: string[]) => SpriteLike
  addSprite: (sprite: SpriteLike) => void
  removeSprite: (sprite: SpriteLike) => void
}

const MANAGER_IDLE_FRAMES = getManagerAnimationFrames({
  action: "idle",
  direction: "front",
})

export const createNpcRenderSystem =
  (roomState: RoomState, store: NpcRenderStore) =>
  (world: GameWorld, _dt: number) => {
    void world
    void _dt

    const currentNpcIds = new Set(roomState.npcs.map((npc) => npc.id))
    for (const [npcId, sprite] of store.sprites) {
      if (!currentNpcIds.has(npcId)) {
        store.removeSprite(sprite)
        store.sprites.delete(npcId)
      }
    }

    for (const npc of roomState.npcs) {
      let sprite = store.sprites.get(npc.id)
      if (!sprite) {
        sprite = store.createAnimatedSprite(MANAGER_IDLE_FRAMES)
        store.sprites.set(npc.id, sprite)
        store.addSprite(sprite)
      }

      sprite.stop()
      sprite.x = npc.x
      sprite.y = npc.y
      sprite.zIndex = npc.y
    }
  }
