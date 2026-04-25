// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest"
import { createGameInputState } from "@/src/input/actions"
import { createKeyboardInputAdapter } from "@/src/input/keyboard"
import { createGamepadInputAdapter } from "@/src/input/gamepad"

const dispatchKey = (
  target: Window,
  type: "keydown" | "keyup",
  key: string,
) => {
  target.dispatchEvent(new KeyboardEvent(type, { key }))
}

describe("game input state", () => {
  it("maps keyboard bindings onto actions", () => {
    const input = createGameInputState({
      adapters: [createKeyboardInputAdapter({ target: window })],
    })

    expect(input.getMovement()).toEqual({ x: 0, y: 0 })
    expect(input.consume("interact")).toBe(false)
    expect(input.consume("pause")).toBe(false)
    expect(input.consume("confirm")).toBe(false)
    expect(input.consume("cancel")).toBe(false)

    dispatchKey(window, "keydown", "w")
    dispatchKey(window, "keydown", "d")
    dispatchKey(window, "keydown", "e")
    dispatchKey(window, "keydown", "Escape")
    dispatchKey(window, "keydown", "Enter")
    dispatchKey(window, "keydown", "Backspace")

    expect(input.getMovement()).toEqual({ x: 1, y: -1 })
    expect(input.isHeld("interact")).toBe(true)
    expect(input.consume("interact")).toBe(true)
    expect(input.consume("interact")).toBe(false)
    expect(input.consume("pause")).toBe(true)
    expect(input.consume("confirm")).toBe(true)
    expect(input.consume("cancel")).toBe(true)

    dispatchKey(window, "keyup", "w")
    dispatchKey(window, "keyup", "d")
    dispatchKey(window, "keyup", "e")

    expect(input.getMovement()).toEqual({ x: 0, y: 0 })
    expect(input.isHeld("interact")).toBe(false)

    input.dispose()
  })

  it("merges gamepad input through the same action layer", () => {
    const getGamepads = vi.fn(() => [
      {
        axes: [0.75, -0.5],
        buttons: [
          { pressed: true },
          { pressed: true },
          { pressed: false },
          { pressed: false },
          { pressed: false },
          { pressed: false },
          { pressed: false },
          { pressed: false },
          { pressed: false },
          { pressed: true },
          { pressed: false },
          { pressed: false },
          { pressed: false },
          { pressed: false },
          { pressed: false },
          { pressed: false },
          { pressed: false },
        ],
      },
    ])
    vi.stubGlobal("navigator", { getGamepads } as Navigator)

    const input = createGameInputState({
      adapters: [createGamepadInputAdapter()],
    })

    input.update()

    expect(input.getMovement()).toEqual({ x: 1, y: -1 })
    expect(input.isHeld("interact")).toBe(true)
    expect(input.consume("interact")).toBe(true)
    expect(input.consume("confirm")).toBe(true)
    expect(input.consume("cancel")).toBe(true)
    expect(input.consume("pause")).toBe(true)

    getGamepads.mockReturnValue([
      {
        axes: [0, 0],
        buttons: Array.from({ length: 17 }, () => ({ pressed: false })),
      },
    ])

    input.update()

    expect(input.getMovement()).toEqual({ x: 0, y: 0 })
    expect(input.isHeld("interact")).toBe(false)

    input.dispose()
    vi.unstubAllGlobals()
  })
})
