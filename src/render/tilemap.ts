import { Sprite, Texture, Rectangle } from "pixi.js"
import type { TiledTileLayer } from "@/src/maps/tiled"
import { resolveTilesetForGid } from "@/src/maps/tiled"

export type TileSpriteLike = {
  x: number
  y: number
}

export type TileSpriteFactory<TSprite extends TileSpriteLike> = (
  tileId: number,
) => TSprite

export type TilesetTexture = {
  firstgid: number
  texture: Texture
}

export const renderTileLayer = <TSprite extends TileSpriteLike>(
  layer: TiledTileLayer,
  tileWidth: number,
  tileHeight: number,
  createSprite: TileSpriteFactory<TSprite>,
  addSprite: (sprite: TSprite) => void,
) => {
  for (let index = 0; index < layer.data.length; index += 1) {
    const gid = layer.data[index]
    if (gid === 0) continue
    const sprite = createSprite(gid)
    sprite.x = (index % layer.width) * tileWidth
    sprite.y = Math.floor(index / layer.width) * tileHeight
    addSprite(sprite)
  }
}

export const createPixiTileSpriteFactory = (
  tilesetTexture: Texture,
  tileWidth: number,
  tileHeight: number,
): TileSpriteFactory<Sprite> => {
  const columns = Math.floor(tilesetTexture.width / tileWidth)
  const baseTexture = tilesetTexture.source
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

export const createPixiMultiTilesetSpriteFactory = (
  tilesets: TilesetTexture[],
  tileWidth: number,
  tileHeight: number,
): TileSpriteFactory<Sprite> => {
  const sortedTilesets = [...tilesets].sort(
    (left, right) => left.firstgid - right.firstgid,
  )
  const cache = new Map<string, Texture>()

  return (gid) => {
    const resolved = resolveTilesetForGid(sortedTilesets, gid)
    if (!resolved) {
      throw new Error(`Missing tileset for gid ${gid}`)
    }
    const tileset = resolved.tileset
    const tileId = resolved.tileId
    const key = `${tileset.firstgid}:${tileId}`
    let texture = cache.get(key)
    if (!texture) {
      const tilesetTexture = tileset.texture
      const columns = Math.floor(tilesetTexture.width / tileWidth)
      const x = (tileId % columns) * tileWidth
      const y = Math.floor(tileId / columns) * tileHeight
      texture = new Texture({
        source: tilesetTexture.source,
        frame: new Rectangle(x, y, tileWidth, tileHeight),
      })
      cache.set(key, texture)
    }
    return new Sprite(texture)
  }
}
