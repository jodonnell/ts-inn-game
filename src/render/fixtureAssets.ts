import type { FixtureState } from "@/src/game/roomState"
import bathroomTileset from "@/assets/spritesheets/bathroom_tileset.png"

export type FixtureAsset = {
  source: string
  frame: {
    x: number
    y: number
    width: number
    height: number
  }
}

const fixtureAssetsByType = {
  bed: {
    dirty: {
      source: bathroomTileset,
      frame: { x: 0, y: 96, width: 64, height: 64 },
    },
    cleaning: {
      source: bathroomTileset,
      frame: { x: 0, y: 96, width: 64, height: 64 },
    },
    clean: {
      source: bathroomTileset,
      frame: { x: 64, y: 96, width: 64, height: 64 },
    },
  },
} as const

export const getFixtureAssetKey = (asset: FixtureAsset): string =>
  `${asset.source}:${asset.frame.x},${asset.frame.y},${asset.frame.width},${asset.frame.height}`

export const getFixtureAssetSources = (): string[] => [
  ...new Set(
    Object.values(fixtureAssetsByType).flatMap((assets) =>
      Object.values(assets).map((asset) => asset.source),
    ),
  ),
]

export const getFixtureAsset = (fixture: {
  type: string
  state: FixtureState
}): FixtureAsset => {
  const assets =
    fixtureAssetsByType[fixture.type as keyof typeof fixtureAssetsByType]
  if (!assets) {
    throw new Error(`Unknown fixture type: ${fixture.type}`)
  }
  return assets[fixture.state]
}
