export type InteractionPoint = {
  x: number
  y: number
  radius: number
  offsetY?: number
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
}

type FixtureBounds = {
  x: number
  y: number
  width: number
  height: number
}

type FixtureWithId = {
  id: string
}

type FixtureSelectionState<TFixture extends FixtureWithId> = {
  activeFixtureId: string | null
  fixtures: TFixture[]
}

type InteractionSelectionState<TFixture extends FixtureWithId & FixtureBounds> =
  FixtureSelectionState<TFixture> & {
    interactionPoint: InteractionPoint
  }

export const getFixtureInteractionPoint = (
  fixture: FixtureBounds,
): InteractionPoint => {
  const radius = Math.max(fixture.width, fixture.height) / 2
  const centerX = fixture.x + fixture.width / 2
  const centerY = fixture.y + fixture.height / 2
  return {
    x: centerX,
    y: centerY,
    radius,
    offsetY: 16,
    bounds: {
      x: fixture.x,
      y: fixture.y,
      width: fixture.width,
      height: fixture.height,
    },
  }
}

export const getActiveFixture = <TFixture extends FixtureWithId>(
  state: FixtureSelectionState<TFixture>,
): TFixture | null =>
  state.fixtures.find((fixture) => fixture.id === state.activeFixtureId) ?? null

export const getCurrentInteractionPoint = <
  TFixture extends FixtureWithId & FixtureBounds,
>(
  state: InteractionSelectionState<TFixture>,
): InteractionPoint => {
  const activeFixture = getActiveFixture(state)
  if (!activeFixture) return state.interactionPoint
  return getFixtureInteractionPoint(activeFixture)
}

export const isWithinInteractionRange = (
  x: number,
  y: number,
  interaction: InteractionPoint,
) => {
  const minX = interaction.bounds.x
  const maxX = interaction.bounds.x + interaction.bounds.width
  const minY = interaction.bounds.y
  const maxY = interaction.bounds.y + interaction.bounds.height
  const dx = Math.max(minX - x, 0, x - maxX)
  const dy = Math.max(minY - y, 0, y - maxY)
  return Math.hypot(dx, dy) <= interaction.radius
}
