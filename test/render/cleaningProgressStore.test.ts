import { describe, expect, it, vi } from "vitest"
import { createCleaningProgressStore } from "@/src/render/cleaningProgress"

const { textConstructor } = vi.hoisted(() => ({
  textConstructor: vi.fn(),
}))

vi.mock("pixi.js", () => {
  class Container {
    children: unknown[] = []
    x = 0
    y = 0
    visible = true
    addChild = vi.fn((child: unknown) => {
      this.children.push(child)
    })
  }
  class Graphics {
    clear = vi.fn()
    roundRect = vi.fn().mockReturnThis()
    fill = vi.fn().mockReturnThis()
  }
  class Text {
    text: string
    x = 0
    y = 0
    anchor = { set: vi.fn() }
    constructor(...args: unknown[]) {
      textConstructor(...args)
      const first = args[0] as { text?: string } | string | undefined
      this.text = typeof first === "string" ? first : (first?.text ?? "")
    }
  }
  return { Container, Graphics, Text }
})

describe("cleaning progress store", () => {
  it("builds a bar container with background, fill, and label", () => {
    const container = { addChild: vi.fn() } as never
    const store = createCleaningProgressStore(container)

    const bar = store.createBar()

    expect(bar.container.children.length).toBe(3)
  })

  it("creates the label text using the pixi object signature", () => {
    const container = { addChild: vi.fn() } as never
    const store = createCleaningProgressStore(container)

    store.createBar()

    expect(textConstructor).toHaveBeenCalledWith({
      text: "Cleaning",
      style: { fill: "#ffffff", fontSize: 10 },
    })
  })
})
