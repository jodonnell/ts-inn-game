export type InputAction =
  | "moveUp"
  | "moveDown"
  | "moveLeft"
  | "moveRight"
  | "interact"
  | "pause"
  | "confirm"
  | "cancel"

export type InputAdapter = {
  consumePressed: () => InputAction[]
  dispose?: () => void
  getHeldActions: () => InputAction[]
  update?: () => void
}

type GameInputOptions = {
  adapters: InputAdapter[]
}

const movementActions = {
  left: "moveLeft",
  right: "moveRight",
  up: "moveUp",
  down: "moveDown",
} as const

export const createGameInputState = ({ adapters }: GameInputOptions) => {
  let held = new Set<InputAction>()
  const queued = new Set<InputAction>()

  const sync = () => {
    const nextHeld = new Set<InputAction>()

    for (const adapter of adapters) {
      adapter.update?.()

      for (const action of adapter.getHeldActions()) {
        nextHeld.add(action)
      }

      for (const action of adapter.consumePressed()) {
        queued.add(action)
      }
    }

    held = nextHeld
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

  const getMovement = () => {
    sync()

    return {
      x:
        (held.has(movementActions.right) ? 1 : 0) -
        (held.has(movementActions.left) ? 1 : 0),
      y:
        (held.has(movementActions.down) ? 1 : 0) -
        (held.has(movementActions.up) ? 1 : 0),
    }
  }

  const dispose = () => {
    for (const adapter of adapters) {
      adapter.dispose?.()
    }
    held.clear()
    queued.clear()
  }

  sync()

  return { consume, dispose, getMovement, isHeld, update }
}

export type GameInputState = ReturnType<typeof createGameInputState>
