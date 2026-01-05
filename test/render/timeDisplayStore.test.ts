import { describe, expect, it, vi } from "vitest"
import { createTimeDisplayStore } from "@/src/render/timeDisplay"

const { textConstructor } = vi.hoisted(() => ({
  textConstructor: vi.fn(),
}))

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
    roundRect = vi.fn().mockReturnThis()
    endFill = vi.fn()
    fill = vi.fn().mockReturnThis()
  }
  class Text {
    text: string
    width = 40
    height = 10
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

describe("time display store", () => {
  it("builds a display container with a background and label", () => {
    const app = { stage: { addChild: vi.fn() } } as never
    const store = createTimeDisplayStore(app)

    const display = store.createDisplay()

    expect(display.container).toBeDefined()
    expect(display.container.children.length).toBe(2)
  })

  it("creates the label text using the new pixi signature", () => {
    const app = { stage: { addChild: vi.fn() } } as never
    const store = createTimeDisplayStore(app, {
      color: "#ffcc00",
      fontSize: 18,
    })

    store.createDisplay()

    expect(textConstructor).toHaveBeenCalledWith({
      text: "00:00",
      style: { fill: "#ffcc00", fontSize: 18 },
    })
  })

  it("draws the rounded background with the new api", () => {
    const app = { stage: { addChild: vi.fn() } } as never
    const store = createTimeDisplayStore(app)

    const display = store.createDisplay()
    const [background] = display.container.children as [Graphics]

    expect(background.roundRect).toHaveBeenCalledWith(0, 0, 52, 22, 6)
  })

  it("fills the background using the new api", () => {
    const app = { stage: { addChild: vi.fn() } } as never
    const store = createTimeDisplayStore(app)

    const display = store.createDisplay()
    const [background] = display.container.children as [Graphics]

    expect(background.fill).toHaveBeenCalledWith({
      color: 0x111111,
      alpha: 0.7,
    })
  })
})
