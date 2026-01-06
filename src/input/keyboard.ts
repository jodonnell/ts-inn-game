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
const interactionKeys = new Set(["e"])

export const createKeyboardInputState = (
  options: KeyboardInputOptions = {},
): InputState & { consumeInteraction: () => boolean; dispose: () => void } => {
  const target = options.target ?? window
  const pressed = new Set<string>()
  let interactionQueued = false

  const normalizeKey = (event: KeyboardEvent) => {
    if (event.key.startsWith("Arrow")) return event.key
    return event.key.toLowerCase()
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const key = normalizeKey(event)
    if (interactionKeys.has(key)) {
      if (!event.repeat) interactionQueued = true
      return
    }
    if (!movementKeys.has(key)) return
    if (event.key.startsWith("Arrow")) {
      event.preventDefault()
    }
    pressed.add(key)
  }

  const onKeyUp = (event: KeyboardEvent) => {
    const key = normalizeKey(event)
    if (interactionKeys.has(key)) return
    if (!movementKeys.has(key)) return
    pressed.delete(key)
  }

  const onBlur = () => {
    pressed.clear()
    interactionQueued = false
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

  const consumeInteraction = () => {
    if (!interactionQueued) return false
    interactionQueued = false
    return true
  }

  const dispose = () => {
    target.removeEventListener("keydown", onKeyDown)
    target.removeEventListener("keyup", onKeyUp)
    target.removeEventListener("blur", onBlur)
    pressed.clear()
    interactionQueued = false
  }

  return { getMovement, consumeInteraction, dispose }
}
