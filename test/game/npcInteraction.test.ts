import { describe, expect, it } from "vitest"
import {
  findNpcInInteractionRange,
  getNpcInteractionPoint,
} from "@/src/game/npcInteraction"

describe("npc interaction helpers", () => {
  const manager = {
    id: "manager",
    name: "Manager",
    x: 352,
    y: 256,
    width: 32,
    height: 32,
  }

  it("builds an interaction point from an npc feet hitbox", () => {
    expect(getNpcInteractionPoint(manager)).toEqual({
      x: 352,
      y: 252,
      radius: 16,
      offsetY: 32,
      bounds: {
        x: 344,
        y: 248,
        width: 16,
        height: 8,
      },
    })
  })

  it("finds the first npc in interaction range", () => {
    expect(findNpcInInteractionRange(352, 264, [manager])).toBe(manager)
  })

  it("returns null when no npc is in interaction range", () => {
    expect(findNpcInInteractionRange(352, 300, [manager])).toBeNull()
  })
})
