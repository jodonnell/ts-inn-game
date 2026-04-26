import { describe, expect, it } from "vitest"
import { getFixtureAsset } from "@/src/render/fixtureAssets"
import bathroomTileset from "@/assets/spritesheets/bathroom_tileset.png"

describe("fixture assets", () => {
  it("uses bathroom tileset frames for the messy bed until cleaning finishes, then the clean bed", () => {
    const messyBed = {
      source: bathroomTileset,
      frame: { x: 0, y: 96, width: 64, height: 64 },
    }
    const cleanBed = {
      source: bathroomTileset,
      frame: { x: 64, y: 96, width: 64, height: 64 },
    }

    expect(getFixtureAsset({ type: "bed", state: "dirty" })).toEqual(messyBed)
    expect(getFixtureAsset({ type: "bed", state: "cleaning" })).toEqual(
      messyBed,
    )
    expect(getFixtureAsset({ type: "bed", state: "clean" })).toEqual(cleanBed)
  })
})
