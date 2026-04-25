import type { InputState } from "@/src/ecs/systems/movement"
import {
  createGameInputState,
  type InputAction,
  type InputAdapter,
} from "@/src/input/actions"

type KeyboardInputOptions = {
  target?: Window | Document
}

const keyActions = new Map<string, InputAction>([
  ["ArrowUp", "moveUp"],
  ["ArrowDown", "moveDown"],
  ["ArrowLeft", "moveLeft"],
  ["ArrowRight", "moveRight"],
  ["w", "moveUp"],
  ["a", "moveLeft"],
  ["s", "moveDown"],
  ["d", "moveRight"],
  ["e", "interact"],
  ["escape", "pause"],
  ["enter", "confirm"],
  ["backspace", "cancel"],
])

export const createKeyboardInputAdapter = (
  options: KeyboardInputOptions = {},
): InputAdapter => {
  const target = options.target ?? window
  const held = new Set<InputAction>()
  const queued = new Set<InputAction>()

  const normalizeKey = (event: KeyboardEvent) => {
    if (event.key.startsWith("Arrow")) return event.key
    return event.key.toLowerCase()
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const key = normalizeKey(event)
    const action = keyActions.get(key)
    if (!action) return
    if (event.key.startsWith("Arrow")) {
      event.preventDefault()
    }
    held.add(action)
    if (!event.repeat) queued.add(action)
  }

  const onKeyUp = (event: KeyboardEvent) => {
    const key = normalizeKey(event)
    const action = keyActions.get(key)
    if (!action) return
    held.delete(action)
  }

  const onBlur = () => {
    held.clear()
    queued.clear()
  }

  target.addEventListener("keydown", onKeyDown)
  target.addEventListener("keyup", onKeyUp)
  target.addEventListener("blur", onBlur)

  const getHeldActions = () => Array.from(held)

  const consumePressed = () => {
    const actions = Array.from(queued)
    queued.clear()
    return actions
  }

  const dispose = () => {
    target.removeEventListener("keydown", onKeyDown)
    target.removeEventListener("keyup", onKeyUp)
    target.removeEventListener("blur", onBlur)
    held.clear()
    queued.clear()
  }

  return { consumePressed, dispose, getHeldActions }
}

export const createKeyboardInputState = (
  options: KeyboardInputOptions = {},
): InputState & {
  consumeInteraction: () => boolean
  isInteractionHeld: () => boolean
  dispose: () => void
  update: () => void
} => {
  const input = createGameInputState({
    adapters: [createKeyboardInputAdapter(options)],
  })

  return {
    consumeInteraction: () => input.consume("interact"),
    dispose: input.dispose,
    getMovement: input.getMovement,
    isInteractionHeld: () => input.isHeld("interact"),
    update: input.update,
  }
}
