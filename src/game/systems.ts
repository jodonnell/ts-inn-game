import {
  createInputSystem,
  createMovementSystem,
} from "@/src/ecs/systems/movement"
import { createFixtureCleaningSystem } from "@/src/ecs/systems/fixtureCleaning"
import { createFixtureTargetingSystem } from "@/src/ecs/systems/fixtureTargeting"
import { createInteractionSystem } from "@/src/ecs/systems/interaction"
import type { RenderSystem, SimulationSystem } from "@/src/ecs/systems/loop"
import { createTeleportSystem } from "@/src/ecs/systems/teleport"
import { createTimeSystem } from "@/src/ecs/systems/time"
import type { GameState } from "@/src/game/gameState"
import { createCameraFollowSystem } from "@/src/render/camera"
import { createCleaningProgressSystem } from "@/src/render/cleaningProgress"
import { createFixtureRenderSystem } from "@/src/render/fixtureRender"
import { createInteractionPromptSystem } from "@/src/render/interactionPrompt"
import { createNightOverlaySystem } from "@/src/render/nightOverlay"
import { createNpcRenderSystem } from "@/src/render/npcRender"
import { createPlayerRenderSystem } from "@/src/render/playerRender"
import { createTimeDisplaySystem } from "@/src/render/timeDisplay"

export type GameSystems = {
  simulationSystems: SimulationSystem[]
  renderSystems: RenderSystem[]
}

export const createGameSystems = (state: GameState): GameSystems => ({
  simulationSystems: [
    createInputSystem(state.player, state.input),
    createMovementSystem(state.player, state.roomState.collisionWalls),
    createTeleportSystem(
      state.player,
      state.roomState.teleportState,
      state.input,
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
    createFixtureRenderSystem(state.roomState, state.renderStore.fixtureStore),
    createNpcRenderSystem(state.roomState, state.renderStore.npcStore),
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
