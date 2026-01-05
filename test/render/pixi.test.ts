// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest"
import { createPixiApp } from "@/src/render/pixi"

vi.mock("pixi.js", () => {
  class Application {
    canvas = document.createElement("canvas")
    init = vi.fn(async () => {})
    destroy = vi.fn()
  }
  return { Application }
})

describe("pixi app", () => {
  it("mounts the canvas into a provided element and can cleanup", async () => {
    const mount = document.createElement("div")
    document.body.appendChild(mount)

    const { app, destroy } = await createPixiApp({ mount })

    expect(mount.querySelector("canvas")).toBe(app.canvas)

    destroy()

    expect(mount.querySelector("canvas")).toBeNull()
  })
})
