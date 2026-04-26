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
import { createConversationSystem } from "@/src/game/conversation"
import { createNpcScheduleSystem } from "@/src/game/npcSchedule"
import type { GameState } from "@/src/game/gameState"
import { createCameraFollowSystem } from "@/src/render/camera"
import { createCleaningProgressSystem } from "@/src/render/cleaningProgress"
import { createFixtureRenderSystem } from "@/src/render/fixtureRender"
import { createInteractionPromptSystem } from "@/src/render/interactionPrompt"
import { createNightOverlaySystem } from "@/src/render/nightOverlay"
import { createNpcRenderSystem } from "@/src/render/npcRender"
import { createPlayerRenderSystem } from "@/src/render/playerRender"
import { createTimeDisplaySystem } from "@/src/render/timeDisplay"
import { createConversationDialogSystem } from "@/src/render/conversationDialog"
import { createInputFlushSystem } from "@/src/input/router"

export type GameSystems = {
  simulationSystems: SimulationSystem[]
  renderSystems: RenderSystem[]
}

export const createGameSystems = (state: GameState): GameSystems => ({
  simulationSystems: [
    createInputSystem(state.player, state.input),
    createConversationSystem(state.conversationState, state.input),
    createMovementSystem(state.player, state.roomState.collisionWalls),
    createInteractionSystem(
      state.player,
      state.input,
      state.roomState,
      state.bellSound,
      state.conversationStarter,
    ),
    createTeleportSystem(
      state.player,
      state.roomState.teleportState,
      state.input,
      state.roomLoader,
    ),
    createTimeSystem(state.gameTime),
    createNpcScheduleSystem({
      gameTime: state.gameTime,
      roomState: state.roomState,
      scheduleState: state.managerSchedule,
      getCurrentMapKey: state.roomLoader.getCurrentMapKey,
    }),
    createFixtureTargetingSystem(state.player, state.roomState),
    createFixtureCleaningSystem(
      state.player,
      state.cleaningInput,
      state.roomState,
    ),
    createInputFlushSystem(state.input),
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
    createConversationDialogSystem(
      state.conversationState,
      state.conversationDialogStore,
    ),
  ],
})
