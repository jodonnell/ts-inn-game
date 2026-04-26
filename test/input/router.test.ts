// @vitest-environment jsdom
import { describe, expect, it } from "vitest"
import { createGameInputState } from "@/src/input/actions"
import { createKeyboardInputAdapter } from "@/src/input/keyboard"
import { createInputRouter } from "@/src/input/router"

const dispatchKey = (
  target: Window,
  type: "keydown" | "keyup",
  key: string,
) => {
  target.dispatchEvent(new KeyboardEvent(type, { key }))
}

describe("input router", () => {
  it("passes gameplay input through by default", () => {
    const baseInput = createGameInputState({
      adapters: [createKeyboardInputAdapter({ target: window })],
    })
    const input = createInputRouter(baseInput)

    dispatchKey(window, "keydown", "d")
    dispatchKey(window, "keydown", "e")

    expect(input.getMovement()).toEqual({ x: 1, y: 0 })
    expect(input.isHeld("interact")).toBe(true)
    expect(input.consume("interact")).toBe(true)

    input.dispose()
  })

  it("blocks gameplay actions while a menu is open", () => {
    const baseInput = createGameInputState({
      adapters: [createKeyboardInputAdapter({ target: window })],
    })
    const input = createInputRouter(baseInput)

    input.pushContext("menu")
    dispatchKey(window, "keydown", "w")
    dispatchKey(window, "keydown", "e")
    dispatchKey(window, "keydown", "Escape")
    dispatchKey(window, "keydown", "Enter")
    dispatchKey(window, "keydown", "Backspace")

    expect(input.getMovement()).toEqual({ x: 0, y: 0 })
    expect(input.isHeld("interact")).toBe(false)
    expect(input.consume("interact")).toBe(false)
    expect(input.consume("pause")).toBe(true)
    expect(input.consume("confirm")).toBe(true)
    expect(input.consume("cancel")).toBe(true)

    input.dispose()
  })

  it("flushes blocked queued actions when a menu opens", () => {
    const baseInput = createGameInputState({
      adapters: [createKeyboardInputAdapter({ target: window })],
    })
    const input = createInputRouter(baseInput)

    dispatchKey(window, "keydown", "e")
    input.pushContext("menu")
    input.popContext()

    expect(input.consume("interact")).toBe(false)

    input.dispose()
  })

  it("suppresses held gameplay actions until release after a blocking context closes", () => {
    const baseInput = createGameInputState({
      adapters: [createKeyboardInputAdapter({ target: window })],
    })
    const input = createInputRouter(baseInput)

    dispatchKey(window, "keydown", "e")
    input.pushContext("menu")
    input.popContext()

    expect(input.isHeld("interact")).toBe(false)
    expect(input.consume("interact")).toBe(false)

    dispatchKey(window, "keyup", "e")
    dispatchKey(window, "keydown", "e")

    expect(input.isHeld("interact")).toBe(true)
    expect(input.consume("interact")).toBe(true)

    input.dispose()
  })

  it("uses the top-most context when multiple blocking layers are open", () => {
    const baseInput = createGameInputState({
      adapters: [createKeyboardInputAdapter({ target: window })],
    })
    const input = createInputRouter(baseInput)

    input.pushContext("menu")
    input.pushContext("modalOverlay")
    dispatchKey(window, "keydown", "Enter")

    expect(input.consume("confirm")).toBe(false)

    input.popContext()

    dispatchKey(window, "keyup", "Enter")
    dispatchKey(window, "keydown", "Enter")

    expect(input.consume("confirm")).toBe(true)

    input.dispose()
  })

  it("only allows interact while a dialog is open", () => {
    const baseInput = createGameInputState({
      adapters: [createKeyboardInputAdapter({ target: window })],
    })
    const input = createInputRouter(baseInput)

    input.pushContext("dialog")
    dispatchKey(window, "keydown", "w")
    dispatchKey(window, "keydown", "e")
    dispatchKey(window, "keydown", "Escape")
    dispatchKey(window, "keydown", "Enter")
    dispatchKey(window, "keydown", "Backspace")

    expect(input.getMovement()).toEqual({ x: 0, y: 0 })
    expect(input.consume("interact")).toBe(true)
    expect(input.consume("pause")).toBe(false)
    expect(input.consume("confirm")).toBe(false)
    expect(input.consume("cancel")).toBe(false)

    input.dispose()
  })

  it("suppresses actions that are held while a dialog opens until release", () => {
    const baseInput = createGameInputState({
      adapters: [createKeyboardInputAdapter({ target: window })],
    })
    const input = createInputRouter(baseInput)

    dispatchKey(window, "keydown", "e")
    input.pushContext("dialog")

    expect(input.consume("interact")).toBe(false)

    dispatchKey(window, "keyup", "e")
    dispatchKey(window, "keydown", "e")

    expect(input.consume("interact")).toBe(true)

    input.dispose()
  })

  it("can flush unconsumed queued actions at the end of a simulation tick", () => {
    const baseInput = createGameInputState({
      adapters: [createKeyboardInputAdapter({ target: window })],
    })
    const input = createInputRouter(baseInput)

    dispatchKey(window, "keydown", "e")
    input.flushQueuedActions()

    expect(input.consume("interact")).toBe(false)

    input.dispose()
  })
})
