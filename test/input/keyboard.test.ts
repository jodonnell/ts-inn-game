// @vitest-environment jsdom
import { describe, expect, it } from "vitest"
import { createKeyboardInputState } from "@/src/input/keyboard"

const dispatchKey = (
  target: Window,
  type: "keydown" | "keyup",
  key: string,
) => {
  target.dispatchEvent(new KeyboardEvent(type, { key }))
}

describe("keyboard input", () => {
  it("returns directional movement for WASD and arrows", () => {
    const input = createKeyboardInputState({ target: window })

    expect(input.getMovement()).toEqual({ x: 0, y: 0 })

    dispatchKey(window, "keydown", "w")
    expect(input.getMovement()).toEqual({ x: 0, y: -1 })

    dispatchKey(window, "keydown", "ArrowRight")
    expect(input.getMovement()).toEqual({ x: 1, y: -1 })

    dispatchKey(window, "keyup", "w")
    expect(input.getMovement()).toEqual({ x: 1, y: 0 })

    dispatchKey(window, "keyup", "ArrowRight")
    expect(input.getMovement()).toEqual({ x: 0, y: 0 })

    input.dispose()
  })

  it("clears movement on blur", () => {
    const input = createKeyboardInputState({ target: window })

    dispatchKey(window, "keydown", "ArrowLeft")
    expect(input.getMovement()).toEqual({ x: -1, y: 0 })

    window.dispatchEvent(new Event("blur"))
    expect(input.getMovement()).toEqual({ x: 0, y: 0 })

    input.dispose()
  })

  it("stops tracking after dispose", () => {
    const input = createKeyboardInputState({ target: window })

    dispatchKey(window, "keydown", "s")
    expect(input.getMovement()).toEqual({ x: 0, y: 1 })

    input.dispose()

    dispatchKey(window, "keydown", "s")
    expect(input.getMovement()).toEqual({ x: 0, y: 0 })
  })
})
