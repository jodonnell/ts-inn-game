import { describe, expect, it } from "vitest"
import { HALLWAY_MANAGER_NPC, getRoomNpcs } from "@/src/game/npcs"

describe("npc registry", () => {
  it("stores the manager position on the hallway map", () => {
    expect(HALLWAY_MANAGER_NPC).toEqual(
      expect.objectContaining({
        id: "manager",
        mapKey: "hallway",
        x: 704,
        y: 256,
      }),
    )
  })

  it("returns npcs for their owning map only", () => {
    expect(getRoomNpcs("hallway")).toEqual([HALLWAY_MANAGER_NPC])
    expect(getRoomNpcs("room")).toEqual([])
  })
})
