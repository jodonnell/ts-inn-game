import { describe, expect, it } from "vitest"
import { getNpcCollisionWall } from "@/src/game/npcs"

describe("npc helpers", () => {
  it("builds a small collision wall around an npc's feet", () => {
    expect(
      getNpcCollisionWall({
        id: "manager",
        name: "Manager",
        mapKey: "hallway",
        x: 544,
        y: 256,
        width: 32,
        height: 32,
      }),
    ).toEqual({
      x: 536,
      y: 248,
      width: 16,
      height: 8,
    })
  })
})
