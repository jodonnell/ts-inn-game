import { createLoop } from "@/src/ecs/systems/loop"
import {
  createInputSystem,
  createMovementSystem,
} from "@/src/ecs/systems/movement"
import { createFixtureCleaningSystem } from "@/src/ecs/systems/fixtureCleaning"
import { createFixtureTargetingSystem } from "@/src/ecs/systems/fixtureTargeting"
import { createInteractionSystem } from "@/src/ecs/systems/interaction"
import { createTeleportSystem } from "@/src/ecs/systems/teleport"
import { createTimeSystem } from "@/src/ecs/systems/time"
import { createCameraFollowSystem } from "@/src/render/camera"
import { createCleaningProgressSystem } from "@/src/render/cleaningProgress"
import { createFixtureRenderSystem } from "@/src/render/fixtureRender"
import { createInteractionPromptSystem } from "@/src/render/interactionPrompt"
import { createPlayerRenderSystem } from "@/src/render/playerRender"
import { createNightOverlaySystem } from "@/src/render/nightOverlay"
import { createTimeDisplaySystem } from "@/src/render/timeDisplay"
import { type GameState, initializeGame } from "@/src/game/gameState"
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
  const loop = createLoop({
    world: state.world,
    simulationDtSeconds: isE2E ? E2E_FIXED_DT_SECONDS : SIMULATION_DT_SECONDS,
    ...(isE2E
      ? {
          ...createUncappedLoopScheduler(),
        }
      : {}),
    simulationSystems: [
      createInputSystem(state.player, state.input),
      createMovementSystem(state.player, state.roomState.collisionWalls),
      createTeleportSystem(
        state.player,
        state.roomState.teleportState,
        state.roomLoader,
      ),
      createTimeSystem(state.gameTime),
      createFixtureTargetingSystem(state.player, state.roomState),
      createFixtureCleaningSystem(
        state.player,
        state.cleaningInput,
        state.roomState,
      ),
      createInteractionSystem(
        state.player,
        state.input,
        state.roomState,
        state.bellSound,
      ),
    ],
    renderSystems: [
      createNightOverlaySystem(state.gameTime, state.nightOverlayStore, {
        sizeProvider: () => ({
          width: state.app.screen.width,
          height: state.app.screen.height,
        }),
      }),
      createCameraFollowSystem(state.player, state.camera),
      createPlayerRenderSystem(state.player, state.renderStore),
      createFixtureRenderSystem(
        state.roomState,
        state.renderStore.fixtureStore,
      ),
      createCleaningProgressSystem(
        state.player,
        state.roomState,
        state.cleaningProgressStore,
      ),
      createInteractionPromptSystem(
        state.player,
        state.promptStore,
        state.roomState,
      ),
      createTimeDisplaySystem(state.gameTime, state.timeDisplayStore),
    ],
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
