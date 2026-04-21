import { describe, expect, it } from "vitest"
import {
  getActiveFixture,
  getCurrentInteractionPoint,
  getFixtureInteractionPoint,
  isWithinInteractionRange,
  type InteractionPoint,
} from "@/src/game/fixtureInteraction"

describe("fixture interaction helpers", () => {
  it("builds an interaction point from fixture bounds", () => {
    expect(
      getFixtureInteractionPoint({
        x: 100,
        y: 120,
        width: 32,
        height: 16,
      }),
    ).toEqual({
      x: 116,
      y: 128,
      radius: 16,
      offsetY: 16,
      bounds: {
        x: 100,
        y: 120,
        width: 32,
        height: 16,
      },
    })
  })

  it("returns the active fixture when the id matches", () => {
    const fixture = { id: "bed-1" }

    expect(
      getActiveFixture({
        activeFixtureId: "bed-1",
        fixtures: [fixture],
      }),
    ).toBe(fixture)
  })

  it("falls back to the default interaction point when no fixture is active", () => {
    const interactionPoint: InteractionPoint = {
      x: 10,
      y: 20,
      radius: 5,
      bounds: { x: 8, y: 18, width: 4, height: 4 },
    }

    expect(
      getCurrentInteractionPoint({
        activeFixtureId: null,
        fixtures: [],
        interactionPoint,
      }),
    ).toBe(interactionPoint)
  })

  it("checks whether a position is within interaction range", () => {
    const interaction: InteractionPoint = {
      x: 116,
      y: 116,
      radius: 12,
      bounds: { x: 100, y: 100, width: 32, height: 32 },
    }

    expect(isWithinInteractionRange(90, 116, interaction)).toBe(true)
    expect(isWithinInteractionRange(70, 116, interaction)).toBe(false)
  })
})
