import type { InputState } from "@/src/ecs/systems/movement"

type KeyboardInputOptions = {
  target?: Window | Document
}

const movementKeys = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "w",
  "a",
  "s",
  "d",
])

export const createKeyboardInputState = (
  options: KeyboardInputOptions = {},
): InputState & { dispose: () => void } => {
  const target = options.target ?? window
  const pressed = new Set<string>()

  const normalizeKey = (event: KeyboardEvent) => {
    if (event.key.startsWith("Arrow")) return event.key
    return event.key.toLowerCase()
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const key = normalizeKey(event)
    if (!movementKeys.has(key)) return
    pressed.add(key)
  }

  const onKeyUp = (event: KeyboardEvent) => {
    const key = normalizeKey(event)
    if (!movementKeys.has(key)) return
    pressed.delete(key)
  }

  const onBlur = () => {
    pressed.clear()
  }

  target.addEventListener("keydown", onKeyDown)
  target.addEventListener("keyup", onKeyUp)
  target.addEventListener("blur", onBlur)

  const getMovement = () => {
    const left = pressed.has("ArrowLeft") || pressed.has("a")
    const right = pressed.has("ArrowRight") || pressed.has("d")
    const up = pressed.has("ArrowUp") || pressed.has("w")
    const down = pressed.has("ArrowDown") || pressed.has("s")

    return {
      x: (right ? 1 : 0) - (left ? 1 : 0),
      y: (down ? 1 : 0) - (up ? 1 : 0),
    }
  }

  const dispose = () => {
    target.removeEventListener("keydown", onKeyDown)
    target.removeEventListener("keyup", onKeyUp)
    target.removeEventListener("blur", onBlur)
    pressed.clear()
  }

  return { getMovement, dispose }
}
