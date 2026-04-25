import { describe, expect, it, vi } from "vitest"
import { createGameSystems } from "@/src/game/systems"
import type { GameState } from "@/src/game/gameState"
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
import { createNpcRenderSystem } from "@/src/render/npcRender"
import { createTimeDisplaySystem } from "@/src/render/timeDisplay"

const inputSystem = vi.fn()
const movementSystem = vi.fn()
const teleportSystem = vi.fn()
const timeSystem = vi.fn()
const fixtureTargetingSystem = vi.fn()
const fixtureCleaningSystem = vi.fn()
const interactionSystem = vi.fn()
const nightOverlaySystem = vi.fn()
const cameraSystem = vi.fn()
const playerRenderSystem = vi.fn()
const fixtureRenderSystem = vi.fn()
const npcRenderSystem = vi.fn()
const cleaningProgressSystem = vi.fn()
const promptSystem = vi.fn()
const timeDisplaySystem = vi.fn()

vi.mock("@/src/ecs/systems/movement", () => ({
  createInputSystem: vi.fn(() => inputSystem),
  createMovementSystem: vi.fn(() => movementSystem),
}))

vi.mock("@/src/ecs/systems/fixtureCleaning", () => ({
  createFixtureCleaningSystem: vi.fn(() => fixtureCleaningSystem),
}))

vi.mock("@/src/ecs/systems/fixtureTargeting", () => ({
  createFixtureTargetingSystem: vi.fn(() => fixtureTargetingSystem),
}))

vi.mock("@/src/ecs/systems/interaction", () => ({
  createInteractionSystem: vi.fn(() => interactionSystem),
}))

vi.mock("@/src/ecs/systems/teleport", () => ({
  createTeleportSystem: vi.fn(() => teleportSystem),
}))

vi.mock("@/src/ecs/systems/time", () => ({
  createTimeSystem: vi.fn(() => timeSystem),
}))

vi.mock("@/src/render/camera", () => ({
  createCameraFollowSystem: vi.fn(() => cameraSystem),
}))

vi.mock("@/src/render/cleaningProgress", () => ({
  createCleaningProgressSystem: vi.fn(() => cleaningProgressSystem),
}))

vi.mock("@/src/render/fixtureRender", () => ({
  createFixtureRenderSystem: vi.fn(() => fixtureRenderSystem),
}))

vi.mock("@/src/render/interactionPrompt", () => ({
  createInteractionPromptSystem: vi.fn(() => promptSystem),
}))

vi.mock("@/src/render/playerRender", () => ({
  createPlayerRenderSystem: vi.fn(() => playerRenderSystem),
}))

vi.mock("@/src/render/nightOverlay", () => ({
  createNightOverlaySystem: vi.fn(() => nightOverlaySystem),
}))

vi.mock("@/src/render/npcRender", () => ({
  createNpcRenderSystem: vi.fn(() => npcRenderSystem),
}))

vi.mock("@/src/render/timeDisplay", () => ({
  createTimeDisplaySystem: vi.fn(() => timeDisplaySystem),
}))

describe("game systems", () => {
  it("builds simulation and render systems separately", () => {
    const state = {
      player: 1,
      input: {
        consume: vi.fn(),
        getMovement: vi.fn(),
        isHeld: vi.fn(),
        update: vi.fn(),
        dispose: vi.fn(),
      },
      roomState: {
        collisionWalls: [],
        teleportState: { zones: [] },
        fixtures: [],
      },
      roomLoader: vi.fn(),
      gameTime: { minutes: 0, daysPassed: 0 },
      cleaningInput: { isHeld: vi.fn() },
      bellSound: { play: vi.fn() },
      nightOverlayStore: {},
      app: { screen: { width: 800, height: 600 } },
      camera: {},
      renderStore: { fixtureStore: {}, npcStore: {} },
      cleaningProgressStore: {},
      promptStore: {},
      timeDisplayStore: {},
    } as unknown as GameState

    const systems = createGameSystems(state)

    expect(systems.simulationSystems).toEqual([
      inputSystem,
      movementSystem,
      teleportSystem,
      timeSystem,
      fixtureTargetingSystem,
      fixtureCleaningSystem,
      interactionSystem,
    ])
    expect(systems.renderSystems).toEqual([
      nightOverlaySystem,
      cameraSystem,
      playerRenderSystem,
      fixtureRenderSystem,
      npcRenderSystem,
      cleaningProgressSystem,
      promptSystem,
      timeDisplaySystem,
    ])

    const [, , nightOverlayOptions] =
      vi.mocked(createNightOverlaySystem).mock.calls[0] ?? []
    expect(nightOverlayOptions.sizeProvider()).toEqual({
      width: 800,
      height: 600,
    })

    expect(vi.mocked(createInputSystem)).toHaveBeenCalledWith(1, state.input)
    expect(vi.mocked(createMovementSystem)).toHaveBeenCalledWith(
      1,
      state.roomState.collisionWalls,
    )
    expect(vi.mocked(createTeleportSystem)).toHaveBeenCalledWith(
      1,
      state.roomState.teleportState,
      state.input,
      state.roomLoader,
    )
    expect(vi.mocked(createTimeSystem)).toHaveBeenCalledWith(state.gameTime)
    expect(vi.mocked(createFixtureTargetingSystem)).toHaveBeenCalledWith(
      1,
      state.roomState,
    )
    expect(vi.mocked(createFixtureCleaningSystem)).toHaveBeenCalledWith(
      1,
      state.cleaningInput,
      state.roomState,
    )
    expect(vi.mocked(createInteractionSystem)).toHaveBeenCalledWith(
      1,
      state.input,
      state.roomState,
      state.bellSound,
    )
    expect(vi.mocked(createCameraFollowSystem)).toHaveBeenCalledWith(
      1,
      state.camera,
    )
    expect(vi.mocked(createPlayerRenderSystem)).toHaveBeenCalledWith(
      1,
      state.renderStore,
    )
    expect(vi.mocked(createFixtureRenderSystem)).toHaveBeenCalledWith(
      state.roomState,
      state.renderStore.fixtureStore,
    )
    expect(vi.mocked(createNpcRenderSystem)).toHaveBeenCalledWith(
      state.roomState,
      state.renderStore.npcStore,
    )
    expect(vi.mocked(createCleaningProgressSystem)).toHaveBeenCalledWith(
      1,
      state.roomState,
      state.cleaningProgressStore,
    )
    expect(vi.mocked(createInteractionPromptSystem)).toHaveBeenCalledWith(
      1,
      state.promptStore,
      state.roomState,
    )
    expect(vi.mocked(createTimeDisplaySystem)).toHaveBeenCalledWith(
      state.gameTime,
      state.timeDisplayStore,
    )
  })
})
