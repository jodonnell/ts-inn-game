import type { GameInputState, InputAction } from "@/src/input/actions"

export type InputContext = "gameplay" | "menu" | "dialog" | "modalOverlay"

const inputActions: InputAction[] = [
  "moveUp",
  "moveDown",
  "moveLeft",
  "moveRight",
  "interact",
  "pause",
  "confirm",
  "cancel",
]

const allowedActionsByContext: Record<InputContext, Set<InputAction>> = {
  gameplay: new Set(inputActions),
  menu: new Set(["pause", "confirm", "cancel"]),
  dialog: new Set(["pause", "confirm", "cancel"]),
  modalOverlay: new Set(["pause", "cancel"]),
}

const movementActions = {
  left: "moveLeft",
  right: "moveRight",
  up: "moveUp",
  down: "moveDown",
} as const

export type RoutedGameInputState = GameInputState & {
  getActiveContext: () => InputContext
  popContext: () => void
  pushContext: (context: Exclude<InputContext, "gameplay">) => void
}

export const createInputRouter = (
  input: GameInputState,
): RoutedGameInputState => {
  const contexts: Exclude<InputContext, "gameplay">[] = []
  const suppressedHeld = new Set<InputAction>()
  let held = new Set<InputAction>()
  const queued = new Set<InputAction>()

  const getActiveContext = (): InputContext => contexts.at(-1) ?? "gameplay"

  const isAllowed = (action: InputAction) =>
    allowedActionsByContext[getActiveContext()].has(action)

  const reconcileSuppressedHeld = (nextHeld: Set<InputAction>) => {
    for (const action of Array.from(suppressedHeld)) {
      if (!nextHeld.has(action)) suppressedHeld.delete(action)
    }

    for (const action of inputActions) {
      if (!isAllowed(action) && nextHeld.has(action)) {
        suppressedHeld.add(action)
      }
    }
  }

  const sync = () => {
    input.update()
    const nextHeld = new Set<InputAction>()
    const nextQueued = new Set<InputAction>()

    for (const action of inputActions) {
      if (input.isHeld(action)) nextHeld.add(action)
      if (input.consume(action)) nextQueued.add(action)
    }

    reconcileSuppressedHeld(nextHeld)

    for (const action of Array.from(suppressedHeld)) {
      if (isAllowed(action) && nextQueued.has(action)) {
        suppressedHeld.delete(action)
      }
    }

    held = new Set(
      Array.from(nextHeld).filter(
        (action) => isAllowed(action) && !suppressedHeld.has(action),
      ),
    )

    for (const action of Array.from(queued)) {
      if (!isAllowed(action) || suppressedHeld.has(action)) {
        queued.delete(action)
      }
    }

    for (const action of nextQueued) {
      if (!isAllowed(action) || suppressedHeld.has(action)) continue
      queued.add(action)
    }
  }

  const update = () => {
    sync()
  }

  const isHeld = (action: InputAction) => {
    sync()
    return held.has(action)
  }

  const consume = (action: InputAction) => {
    sync()
    if (!queued.has(action)) return false
    queued.delete(action)
    return true
  }

  const getMovement = () => ({
    x:
      (isHeld(movementActions.right) ? 1 : 0) -
      (isHeld(movementActions.left) ? 1 : 0),
    y:
      (isHeld(movementActions.down) ? 1 : 0) -
      (isHeld(movementActions.up) ? 1 : 0),
  })

  const pushContext = (context: Exclude<InputContext, "gameplay">) => {
    contexts.push(context)
    sync()
  }

  const popContext = () => {
    contexts.pop()
    sync()
  }

  return {
    consume,
    dispose: input.dispose,
    getActiveContext,
    getMovement,
    isHeld,
    popContext,
    pushContext,
    update,
  }
}
