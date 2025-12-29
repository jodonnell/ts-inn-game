import { Sprite, Texture, Rectangle } from "pixi.js"
import type { TiledTileLayer } from "@/src/maps/tiled"
import { buildTilePlacements } from "@/src/maps/tiled"

export type TileSpriteLike = {
  x: number
  y: number
}

export type TileSpriteFactory<TSprite extends TileSpriteLike> = (
  tileId: number,
) => TSprite

export const renderTileLayer = <TSprite extends TileSpriteLike>(
  layer: TiledTileLayer,
  tileWidth: number,
  tileHeight: number,
  firstGid: number,
  createSprite: TileSpriteFactory<TSprite>,
  addSprite: (sprite: TSprite) => void,
) => {
  const placements = buildTilePlacements(layer, tileWidth, tileHeight, firstGid)
  for (const placement of placements) {
    const sprite = createSprite(placement.tileId)
    sprite.x = placement.x
    sprite.y = placement.y
    addSprite(sprite)
  }
}

export const createPixiTileSpriteFactory = (
  tilesetTexture: Texture,
  tileWidth: number,
  tileHeight: number,
): TileSpriteFactory<Sprite> => {
  const columns = Math.floor(tilesetTexture.width / tileWidth)
  const baseTexture = tilesetTexture.baseTexture
  const cache = new Map<number, Texture>()

  return (tileId) => {
    let texture = cache.get(tileId)
    if (!texture) {
      const x = (tileId % columns) * tileWidth
      const y = Math.floor(tileId / columns) * tileHeight
      texture = new Texture({
        source: baseTexture,
        frame: new Rectangle(x, y, tileWidth, tileHeight),
      })
      cache.set(tileId, texture)
    }
    return new Sprite(texture)
  }
}
