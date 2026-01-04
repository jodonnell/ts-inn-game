import { describe, expect, it, vi } from "vitest"
import { createGameWorld } from "@/src/ecs/world"
import { createGameTimeState } from "@/src/ecs/systems/time"
import {
  createNightOverlayStore,
  createNightOverlaySystem,
} from "@/src/render/nightOverlay"
import { Graphics } from "pixi.js"

vi.mock("pixi.js", () => {
  class Container {
    children: unknown[] = []
    addChild = vi.fn((child: unknown) => {
      this.children.push(child)
    })
  }
  class Graphics {
    clear = vi.fn()
    beginFill = vi.fn()
    drawRect = vi.fn()
    endFill = vi.fn()
    x = 0
    y = 0
    alpha = 0
  }
  return { Container, Graphics }
})

describe("night overlay system", () => {
  it("darkens during night hours and clears during day", () => {
    const world = createGameWorld()
    const time = createGameTimeState(20 * 60)
    const layout = vi.fn()
    const overlay = { alpha: 0, x: 0, y: 0, layout }
    const store = {
      overlay: null,
      createOverlay: () => overlay,
      addOverlay: vi.fn(),
    }

    const system = createNightOverlaySystem(time, store, {
      nightStartMinutes: 20 * 60,
      nightEndMinutes: 5 * 60,
      alpha: 0.6,
      transitionMinutes: 60,
      sizeProvider: () => ({ width: 100, height: 80 }),
    })
    system(world, 0)

    expect(store.overlay).toBe(overlay)
    expect(overlay.alpha).toBe(0)
    expect(layout).toHaveBeenCalledWith(100, 80)

    time.minutes = 20 * 60 + 30
    system(world, 0)

    expect(overlay.alpha).toBeCloseTo(0.3)

    time.minutes = 21 * 60
    system(world, 0)

    expect(overlay.alpha).toBe(0.6)

    time.minutes = 4 * 60 + 30
    system(world, 0)

    expect(overlay.alpha).toBeCloseTo(0.3)

    time.minutes = 12 * 60
    system(world, 0)

    expect(overlay.alpha).toBe(0)
  })
})

describe("night overlay store", () => {
  it("creates and adds an overlay to the container", () => {
    const container = { addChild: vi.fn() }
    const store = createNightOverlayStore(container)

    const overlay = store.createOverlay()
    store.addOverlay(overlay)

    expect(overlay).toBeInstanceOf(Graphics)
    expect(container.addChild).toHaveBeenCalledWith(overlay)
  })
})
