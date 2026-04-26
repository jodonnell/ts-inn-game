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
      radius: 32,
      offsetY: 16,
      bounds: {
        x: 100,
        y: 120,
        width: 32,
        height: 16,
      },
    })
  })

  it("uses the full fixture bounds with one-tile reach for large fixtures", () => {
    expect(
      getFixtureInteractionPoint({
        x: 384,
        y: 224,
        width: 160,
        height: 160,
      }),
    ).toEqual({
      x: 464,
      y: 304,
      radius: 32,
      offsetY: 16,
      bounds: {
        x: 384,
        y: 224,
        width: 160,
        height: 160,
      },
    })
  })

  it("treats a large fixture as interactable from one tile away on every side", () => {
    const interaction = getFixtureInteractionPoint({
      x: 384,
      y: 224,
      width: 160,
      height: 160,
    })

    expect(isWithinInteractionRange(352, 304, interaction)).toBe(true)
    expect(isWithinInteractionRange(576, 304, interaction)).toBe(true)
    expect(isWithinInteractionRange(464, 192, interaction)).toBe(true)
    expect(isWithinInteractionRange(464, 416, interaction)).toBe(true)
    expect(isWithinInteractionRange(351, 304, interaction)).toBe(false)
    expect(isWithinInteractionRange(577, 304, interaction)).toBe(false)
    expect(isWithinInteractionRange(464, 191, interaction)).toBe(false)
    expect(isWithinInteractionRange(464, 417, interaction)).toBe(false)
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
