import { createLoop } from "@/src/ecs/systems/loop"
import {
  createInputSystem,
  createMovementSystem,
} from "@/src/ecs/systems/movement"
import { createInteractionSystem } from "@/src/ecs/systems/interaction"
import { createTeleportSystem } from "@/src/ecs/systems/teleport"
import { createTimeSystem } from "@/src/ecs/systems/time"
import { createCameraFollowSystem } from "@/src/render/camera"
import { createInteractionPromptSystem } from "@/src/render/interactionPrompt"
import { createPlayerRenderSystem } from "@/src/render/playerRender"
import { createNightOverlaySystem } from "@/src/render/nightOverlay"
import { createTimeDisplaySystem } from "@/src/render/timeDisplay"
import { type GameState, initializeGame } from "@/src/game/gameState"
import { installGameTestApi } from "@/src/game/testHooks"

export const createGameLoop = (state: GameState) => {
  const loop = createLoop({
    world: state.world,
    systems: [
      createInputSystem(state.player, state.input),
      createMovementSystem(state.player, state.roomState.collisionWalls),
      createTeleportSystem(
        state.player,
        state.roomState.teleportState,
        state.roomLoader,
      ),
      createTimeSystem(state.gameTime),
      createNightOverlaySystem(state.gameTime, state.nightOverlayStore, {
        sizeProvider: () => ({
          width: state.app.screen.width,
          height: state.app.screen.height,
        }),
      }),
      createCameraFollowSystem(state.player, state.camera),
      createPlayerRenderSystem(state.player, state.renderStore),
      createInteractionPromptSystem(
        state.player,
        state.promptStore,
        state.roomState.interactionPoint,
      ),
      createInteractionSystem(
        state.player,
        state.input,
        state.roomState.interactionPoint,
        state.bellSound,
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
    const params = new URLSearchParams(window.location.search)
    if (params.has("e2e")) {
      installGameTestApi(state, window)
    }
  }

  return { app: state.app, world: state.world, loop }
}
