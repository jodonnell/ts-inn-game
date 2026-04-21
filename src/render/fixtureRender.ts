import type { GameWorld } from "@/src/ecs/world"
import type { RoomState } from "@/src/game/roomState"
import { getFixtureAsset } from "@/src/render/fixtureAssets"

export type FixtureSpriteLike = {
  x: number
  y: number
  setAsset: (assetId: string) => void
}

export type FixtureRenderStore = {
  sprites: Map<string, FixtureSpriteLike>
  createSprite: (assetId: string) => FixtureSpriteLike
  addSprite: (sprite: FixtureSpriteLike) => void
}

export const createFixtureRenderSystem =
  (roomState: RoomState, store: FixtureRenderStore) =>
  (_world: GameWorld, _dt: number) => {
    void _world
    void _dt

    for (const fixture of roomState.fixtures) {
      let sprite = store.sprites.get(fixture.id)
      const assetId = getFixtureAsset(fixture)
      if (!sprite) {
        sprite = store.createSprite(assetId)
        store.sprites.set(fixture.id, sprite)
        store.addSprite(sprite)
      } else {
        sprite.setAsset(assetId)
      }
      sprite.x = fixture.x
      sprite.y = fixture.y
    }
  }
