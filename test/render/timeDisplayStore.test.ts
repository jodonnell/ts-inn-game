import { describe, expect, it, vi } from "vitest"
import { createTimeDisplayStore } from "@/src/render/timeDisplay"

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
    drawRoundedRect = vi.fn()
    endFill = vi.fn()
  }
  class Text {
    text: string
    width = 40
    height = 10
    x = 0
    y = 0
    anchor = { set: vi.fn() }
    constructor(text: string) {
      this.text = text
    }
  }
  return { Container, Graphics, Text }
})

describe("time display store", () => {
  it("builds a display container with a background and label", () => {
    const app = { stage: { addChild: vi.fn() } } as never
    const store = createTimeDisplayStore(app)

    const display = store.createDisplay()

    expect(display.container).toBeDefined()
    expect(display.container.children.length).toBe(2)
  })
})
