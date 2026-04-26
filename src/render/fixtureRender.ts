import type { GameWorld } from "@/src/ecs/world"
import type { RoomState } from "@/src/game/roomState"
import type { FixtureAsset } from "@/src/render/fixtureAssets"
import { getFixtureAsset } from "@/src/render/fixtureAssets"
import { getFixtureAssetKey } from "@/src/render/fixtureAssets"

export type FixtureSpriteLike = {
  x: number
  y: number
  assetKey?: string
  setAsset: (asset: FixtureAsset) => void
}

export type FixtureRenderStore = {
  sprites: Map<string, FixtureSpriteLike>
  createSprite: (asset: FixtureAsset) => FixtureSpriteLike
  addSprite: (sprite: FixtureSpriteLike) => void
  removeSprite: (sprite: FixtureSpriteLike) => void
}

export const createFixtureRenderSystem =
  (roomState: RoomState, store: FixtureRenderStore) =>
  (_world: GameWorld, _dt: number) => {
    void _world
    void _dt

    const fixtureIds = new Set(roomState.fixtures.map((fixture) => fixture.id))
    for (const [fixtureId, sprite] of store.sprites) {
      if (fixtureIds.has(fixtureId)) continue
      store.removeSprite(sprite)
      store.sprites.delete(fixtureId)
    }

    for (const fixture of roomState.fixtures) {
      let sprite = store.sprites.get(fixture.id)
      const asset = getFixtureAsset(fixture)
      const assetKey = getFixtureAssetKey(asset)
      if (!sprite) {
        sprite = store.createSprite(asset)
        sprite.assetKey = assetKey
        store.sprites.set(fixture.id, sprite)
        store.addSprite(sprite)
      } else if (sprite.assetKey !== assetKey) {
        sprite.setAsset(asset)
        sprite.assetKey = assetKey
      }
      sprite.x = fixture.x + fixture.width / 2
      sprite.y = fixture.y + fixture.height
    }
  }
