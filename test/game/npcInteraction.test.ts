import { describe, expect, it } from "vitest"
import {
  findNpcInInteractionRange,
  getNpcInteractionPoint,
} from "@/src/game/npcInteraction"

describe("npc interaction helpers", () => {
  const manager = {
    id: "manager",
    name: "Manager",
    mapKey: "hallway",
    x: 352,
    y: 256,
    width: 32,
    height: 32,
  }

  it("builds an interaction point around the npc sprite", () => {
    expect(getNpcInteractionPoint(manager)).toEqual({
      x: 352,
      y: 240,
      radius: 32,
      offsetY: 32,
      bounds: {
        x: 336,
        y: 224,
        width: 32,
        height: 32,
      },
    })
  })

  it("finds the first npc in interaction range", () => {
    expect(findNpcInInteractionRange(352, 264, [manager])).toBe(manager)
  })

  it("finds an npc from a normal standing distance below them", () => {
    expect(findNpcInInteractionRange(352, 288, [manager])).toBe(manager)
  })

  it("returns null when no npc is in interaction range", () => {
    expect(findNpcInInteractionRange(352, 300, [manager])).toBeNull()
  })
})
