import { describe, expect, it, vi } from "vitest"
import { startGame } from "@/src/game/bootstrap"
import { createLoop } from "@/src/ecs/systems/loop"
import { createCameraFollowSystem } from "@/src/render/camera"
import { createInteractionPromptSystem } from "@/src/render/interactionPrompt"

const loopStart = vi.fn()
const loopStop = vi.fn()
const loopStep = vi.fn()

const world = {}
const player = 1
const inputSystem = vi.fn()
const movementSystem = vi.fn()
const renderSystem = vi.fn()
const cameraSystem = vi.fn()
const promptSystem = vi.fn()

vi.mock("@/src/ecs/systems/loop", () => ({
  createLoop: vi.fn(() => ({
    start: loopStart,
    stop: loopStop,
    step: loopStep,
  })),
}))

vi.mock("@/src/ecs/world", () => ({
  createGameWorld: vi.fn(() => world),
}))

vi.mock("@/src/ecs/entities/player", () => ({
  spawnPlayer: vi.fn(() => player),
}))

vi.mock("@/src/input/keyboard", () => ({
  createKeyboardInputState: vi.fn(() => ({
    getMovement: () => ({ x: 0, y: 0 }),
    dispose: vi.fn(),
  })),
}))

vi.mock("@/src/ecs/systems/movement", () => ({
  createInputSystem: vi.fn(() => inputSystem),
  createMovementSystem: vi.fn(() => movementSystem),
}))

vi.mock("@/src/render/playerRender", () => ({
  createPlayerRenderSystem: vi.fn(() => renderSystem),
}))

vi.mock("@/src/render/camera", () => ({
  createCameraFollowSystem: vi.fn(() => cameraSystem),
}))

vi.mock("@/src/render/interactionPrompt", () => ({
  createInteractionPromptSystem: vi.fn(() => promptSystem),
}))

vi.mock("@/src/render/pixi", () => ({
  createPixiApp: vi.fn(async () => ({
    stage: { pivot: { x: 0, y: 0 }, position: { x: 0, y: 0 } },
    screen: { width: 800, height: 600 },
  })),
  loadManagerSpritesheet: vi.fn(async () => ({})),
  createPixiRenderStore: vi.fn(() => ({
    sprites: new Map(),
    createSprite: vi.fn(),
    addSprite: vi.fn(),
  })),
}))

vi.mock("@/src/debug/perf", () => ({
  installDebugPerfOverlay: vi.fn(),
}))

vi.mock("pixi.js", () => ({
  Text: class {
    x = 0
    y = 0
    visible = false
    anchor = { set: vi.fn() }
  },
}))

describe("game bootstrap", () => {
  it("wires camera and interaction prompt systems into the loop", async () => {
    await startGame()

    expect(vi.mocked(createCameraFollowSystem)).toHaveBeenCalledWith(
      player,
      expect.objectContaining({ setPosition: expect.any(Function) }),
    )

    expect(vi.mocked(createInteractionPromptSystem)).toHaveBeenCalledWith(
      player,
      expect.objectContaining({
        prompt: null,
        createPrompt: expect.any(Function),
        addPrompt: expect.any(Function),
      }),
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
    )

    expect(vi.mocked(createLoop)).toHaveBeenCalledWith({
      world,
      systems: [
        inputSystem,
        movementSystem,
        cameraSystem,
        renderSystem,
        promptSystem,
      ],
    })
  })
})
