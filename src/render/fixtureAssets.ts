import type { FixtureState } from "@/src/game/roomState"

const fixtureAssetsByType = {
  bed: {
    dirty: "/assets/tiled/bed.png",
    cleaning: "/assets/tiled/bed.png",
    clean: "/assets/tiled/bed.png",
  },
} as const

export const getFixtureAsset = (fixture: {
  type: string
  state: FixtureState
}): string => {
  const assets =
    fixtureAssetsByType[fixture.type as keyof typeof fixtureAssetsByType]
  if (!assets) {
    throw new Error(`Unknown fixture type: ${fixture.type}`)
  }
  return assets[fixture.state]
}
