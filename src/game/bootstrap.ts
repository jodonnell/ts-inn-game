import { createLoop } from "@/src/ecs/systems/loop"
import { type GameState, initializeGame } from "@/src/game/gameState"
import { createGameSystems } from "@/src/game/systems"
import { installGameTestApi } from "@/src/game/testHooks"

const getSearchParams = () => {
  if (typeof window === "undefined") return new URLSearchParams()
  return new URLSearchParams(window.location.search)
}

const createUncappedLoopScheduler = () => ({
  scheduleFrame: (cb: (time: number) => void) =>
    window.setTimeout(() => cb(performance.now()), 0),
  cancelScheduledFrame: (id: number) => window.clearTimeout(id),
})

const E2E_FIXED_DT_SECONDS = 1 / 120
const SIMULATION_DT_SECONDS = 1 / 60

export const createGameLoop = (state: GameState) => {
  const params = getSearchParams()
  const isE2E = params.has("e2e")
  const systems = createGameSystems(state)
  const loop = createLoop({
    world: state.world,
    simulationDtSeconds: isE2E ? E2E_FIXED_DT_SECONDS : SIMULATION_DT_SECONDS,
    ...(isE2E
      ? {
          ...createUncappedLoopScheduler(),
        }
      : {}),
    ...systems,
  })

  return loop
}

export const startGame = async () => {
  const state = await initializeGame()
  const loop = createGameLoop(state)
  loop.start()

  if (import.meta.env.MODE !== "production" && typeof window !== "undefined") {
    const params = getSearchParams()
    if (params.has("e2e")) {
      installGameTestApi(state, window)
    }
  }

  return { app: state.app, world: state.world, loop }
}
