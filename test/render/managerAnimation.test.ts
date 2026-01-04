import { describe, expect, it } from "vitest"
import {
  getManagerAnimationFrames,
  selectManagerAnimationState,
} from "@/src/render/managerAnimation"

describe("manager animation", () => {
  it("selects walk direction based on velocity", () => {
    expect(selectManagerAnimationState({ x: 10, y: 0 }, "front")).toEqual({
      action: "walk",
      direction: "right",
    })
    expect(selectManagerAnimationState({ x: -3, y: 1 }, "front")).toEqual({
      action: "walk",
      direction: "left",
    })
    expect(selectManagerAnimationState({ x: 0, y: -5 }, "front")).toEqual({
      action: "walk",
      direction: "back",
    })
    expect(selectManagerAnimationState({ x: 0, y: 7 }, "front")).toEqual({
      action: "walk",
      direction: "front",
    })
  })

  it("keeps the last direction when idle", () => {
    expect(selectManagerAnimationState({ x: 0, y: 0 }, "left")).toEqual({
      action: "idle",
      direction: "left",
    })
  })

  it("returns ordered frame names for a direction/action", () => {
    expect(
      getManagerAnimationFrames({ action: "walk", direction: "front" }),
    ).toEqual([
      "0005-manager-all-frames_frontwalk_0001.png",
      "0006-manager-all-frames_frontwalk_0002.png",
      "0007-manager-all-frames_frontwalk_0003.png",
      "0008-manager-all-frames_frontwalk_0004.png",
    ])

    expect(
      getManagerAnimationFrames({ action: "idle", direction: "left" }),
    ).toEqual(["0022-manager-all-frames_leftidle_0001.png"])
  })
})
