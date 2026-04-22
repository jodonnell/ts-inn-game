import { describe, expect, it } from "vitest"
import { getFixtureAsset } from "@/src/render/fixtureAssets"

describe("fixture assets", () => {
  it("uses the same bed sprite for dirty and clean states for now", () => {
    expect(getFixtureAsset({ type: "bed", state: "dirty" })).toBe(
      "/assets/tiled/bed.png",
    )
    expect(getFixtureAsset({ type: "bed", state: "cleaning" })).toBe(
      "/assets/tiled/bed.png",
    )
    expect(getFixtureAsset({ type: "bed", state: "clean" })).toBe(
      "/assets/tiled/bed.png",
    )
  })
})
