import { describe, expect, it } from "vitest"
import { getFixtureAsset } from "@/src/render/fixtureAssets"
import bedAsset from "@/assets/tiled/bed.png"

describe("fixture assets", () => {
  it("uses the imported bed asset URL for every current bed state", () => {
    expect(getFixtureAsset({ type: "bed", state: "dirty" })).toBe(bedAsset)
    expect(getFixtureAsset({ type: "bed", state: "cleaning" })).toBe(bedAsset)
    expect(getFixtureAsset({ type: "bed", state: "clean" })).toBe(bedAsset)
  })
})
