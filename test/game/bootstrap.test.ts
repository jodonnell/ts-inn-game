import { describe, expect, it, vi } from "vitest"
import { startGame } from "@/src/game/bootstrap"
import { createLoop } from "@/src/ecs/systems/loop"
import {
  createCameraAdapter,
  createCameraFollowSystem,
} from "@/src/render/camera"
import {
  createInteractionPromptSystem,
  createPromptStore,
} from "@/src/render/interactionPrompt"
import { createTeleportSystem } from "@/src/ecs/systems/teleport"
import { createRoomLoader } from "@/src/game/roomLoader"
import { createTimeDisplayStore } from "@/src/render/timeDisplay"
import { createNightOverlayStore } from "@/src/render/nightOverlay"
import { createPixiRenderStore } from "@/src/render/pixi"
import { Container } from "pixi.js"

const loopStart = vi.fn()
const loopStop = vi.fn()
const loopStep = vi.fn()

const world = {}
const player = 1
const inputSystem = vi.fn()
const movementSystem = vi.fn()
const teleportSystem = vi.fn()
const renderSystem = vi.fn()
const cameraSystem = vi.fn()
const promptSystem = vi.fn()
const timeSystem = vi.fn()
const timeState = { minutes: 0 }
const timeDisplaySystem = vi.fn()
const nightOverlaySystem = vi.fn()
const tileSpriteFactory = vi.fn()
const loadRoom = vi.fn()
const map = vi.hoisted(() => ({
  width: 2,
  height: 2,
  tilewidth: 32,
  tileheight: 32,
  layers: [
    {
      type: "tilelayer",
      name: "ground",
      width: 2,
      height: 2,
      data: [1, 0, 0, 0],
    },
    {
      type: "tilelayer",
      name: "decor",
      width: 2,
      height: 2,
      data: [0, 0, 0, 2],
    },
  ],
  tilesets: [{ firstgid: 1 }],
}))

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

vi.mock("@/src/ecs/systems/teleport", () => ({
  createTeleportSystem: vi.fn(() => teleportSystem),
}))

vi.mock("@/src/ecs/systems/time", () => ({
  createGameTimeState: vi.fn(() => timeState),
  createTimeSystem: vi.fn(() => timeSystem),
}))

vi.mock("@/src/render/playerRender", () => ({
  createPlayerRenderSystem: vi.fn(() => renderSystem),
}))

vi.mock("@/src/render/camera", () => ({
  createCameraAdapter: vi.fn(() => ({ setPosition: vi.fn() })),
  createCameraFollowSystem: vi.fn(() => cameraSystem),
}))

vi.mock("@/src/render/interactionPrompt", () => ({
  createInteractionPromptSystem: vi.fn(() => promptSystem),
  createPromptStore: vi.fn(() => ({
    prompt: null,
    createPrompt: vi.fn(),
    addPrompt: vi.fn(),
  })),
}))

vi.mock("@/src/render/pixi", () => ({
  createPixiApp: vi.fn(async () => ({
    stage: {
      pivot: { x: 0, y: 0 },
      position: { x: 0, y: 0 },
      addChild: vi.fn(),
    },
    screen: { width: 800, height: 600 },
  })),
  loadManagerSpritesheet: vi.fn(async () => ({})),
  loadTileSheetTexture: vi.fn(async () => ({})),
  createPixiRenderStore: vi.fn(() => ({
    sprites: new Map(),
    createSprite: vi.fn(),
    addSprite: vi.fn(),
  })),
}))

vi.mock("@/src/render/tilemap", () => ({
  createPixiTileSpriteFactory: vi.fn(() => tileSpriteFactory),
}))

vi.mock("@/src/game/roomLoader", () => ({
  createRoomLoader: vi.fn(() => loadRoom),
}))

vi.mock("@/src/render/timeDisplay", () => ({
  createTimeDisplayStore: vi.fn(() => ({
    display: null,
    createDisplay: vi.fn(),
    addDisplay: vi.fn(),
  })),
  createTimeDisplaySystem: vi.fn(() => timeDisplaySystem),
}))

vi.mock("@/src/render/nightOverlay", () => ({
  createNightOverlayStore: vi.fn(() => ({
    overlay: null,
    createOverlay: vi.fn(),
    addOverlay: vi.fn(),
  })),
  createNightOverlaySystem: vi.fn(() => nightOverlaySystem),
}))

vi.mock("@/assets/maps/inn.json", () => ({ default: map }))
vi.mock("@/assets/maps/room1.json", () => ({ default: map }))

vi.mock("@/src/debug/perf", () => ({
  installDebugPerfOverlay: vi.fn(),
}))

vi.mock("pixi.js", () => ({
  Container: class {
    addChild = vi.fn()
    removeChildren = vi.fn()
  },
  Text: class {
    x = 0
    y = 0
    visible = false
    anchor = { set: vi.fn() }
  },
}))

describe("game bootstrap", () => {
  it("wires map rendering and gameplay systems into the loop", async () => {
    await startGame()

    expect(vi.mocked(createRoomLoader)).toHaveBeenCalledWith(
      expect.objectContaining({
        mapsByKey: { inn: map, room1: map },
        player,
        tileSpriteFactory,
      }),
    )
    expect(loadRoom).toHaveBeenCalledWith("inn")

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
      expect.objectContaining({ x: 200, y: 180 }),
    )

    expect(vi.mocked(createTeleportSystem)).toHaveBeenCalledWith(
      player,
      expect.objectContaining({ zones: [] }),
      loadRoom,
    )

    expect(vi.mocked(createLoop)).toHaveBeenCalledWith({
      world,
      systems: [
        inputSystem,
        movementSystem,
        teleportSystem,
        timeSystem,
        nightOverlaySystem,
        cameraSystem,
        renderSystem,
        promptSystem,
        timeDisplaySystem,
      ],
    })

    expect(vi.mocked(createTimeDisplayStore)).toHaveBeenCalledWith(
      expect.any(Container),
    )
    expect(vi.mocked(createNightOverlayStore)).toHaveBeenCalledWith(
      expect.any(Container),
    )

    const [, worldContainer] = vi.mocked(createCameraAdapter).mock.calls[0]
    const [uiContainer] = vi.mocked(createTimeDisplayStore).mock.calls[0]
    const [overlayContainer] = vi.mocked(createNightOverlayStore).mock.calls[0]

    expect(worldContainer).toBeInstanceOf(Container)
    expect(uiContainer).toBeInstanceOf(Container)
    expect(overlayContainer).toBeInstanceOf(Container)
    expect(uiContainer).not.toBe(worldContainer)
    expect(overlayContainer).not.toBe(worldContainer)
    expect(overlayContainer).not.toBe(uiContainer)

    expect(vi.mocked(createPixiRenderStore)).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      worldContainer,
    )
    expect(vi.mocked(createPromptStore)).toHaveBeenCalledWith(worldContainer)
  })
})
