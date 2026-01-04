import { describe, expect, it, vi } from "vitest"
import { createGameWorld } from "@/src/ecs/world"
import { createGameTimeState } from "@/src/ecs/systems/time"
import {
  createTimeDisplaySystem,
  type TimeDisplayStore,
} from "@/src/render/timeDisplay"

describe("time display system", () => {
  it("renders HH:MM and positions the display", () => {
    const world = createGameWorld()
    const time = createGameTimeState(65)
    const layout = vi.fn()
    const display = {
      x: 0,
      y: 0,
      text: "",
      visible: false,
      layout,
      container: {},
    }
    const store: TimeDisplayStore = {
      display: null,
      createDisplay: () => display,
      addDisplay: () => {},
    }

    const system = createTimeDisplaySystem(time, store, { x: 10, y: 20 })
    system(world, 0)

    expect(store.display).toBe(display)
    expect(display.text).toBe("Spring 1 01:05")
    expect(display.x).toBe(10)
    expect(display.y).toBe(20)
    expect(display.visible).toBe(true)
    expect(layout).toHaveBeenCalled()
  })

  it("renders the current seasonal date", () => {
    const world = createGameWorld()
    const time = createGameTimeState(0)
    time.daysPassed = 31
    const display = {
      x: 0,
      y: 0,
      text: "",
      visible: false,
      container: {},
    }
    const store: TimeDisplayStore = {
      display: display,
      createDisplay: () => display,
      addDisplay: () => {},
    }

    const system = createTimeDisplaySystem(time, store)
    system(world, 0)

    expect(display.text).toContain("Summer 1")
  })
})
