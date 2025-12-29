import { describe, expect, it, vi } from "vitest"
import { startGame } from "@/src/game/bootstrap"
import { createLoop } from "@/src/ecs/systems/loop"
import { createCameraFollowSystem } from "@/src/render/camera"
import { createInteractionPromptSystem } from "@/src/render/interactionPrompt"
import { renderTileLayer } from "@/src/render/tilemap"
import {
  extractCollisionWalls,
  findInteractionPoint,
  findSpawnPoint,
} from "@/src/maps/tiled"

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
const tileSpriteFactory = vi.fn()
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
  renderTileLayer: vi.fn(),
}))

vi.mock("@/src/maps/tiled", () => ({
  buildTilePlacements: vi.fn(),
  extractCollisionWalls: vi.fn(() => [{ x: 1, y: 2, width: 3, height: 4 }]),
  findInteractionPoint: vi.fn(() => ({
    x: 10,
    y: 20,
    radius: 12,
    offsetY: 16,
  })),
  findSpawnPoint: vi.fn(() => ({ x: 5, y: 7 })),
}))

vi.mock("@/assets/maps/inn.json", () => ({ default: map }))

vi.mock("@/src/debug/perf", () => ({
  installDebugPerfOverlay: vi.fn(),
}))

vi.mock("pixi.js", () => ({
  Container: class {
    addChild = vi.fn()
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

    expect(vi.mocked(findSpawnPoint)).toHaveBeenCalledWith(map, "player_spawn")
    expect(vi.mocked(extractCollisionWalls)).toHaveBeenCalledWith(map)
    expect(vi.mocked(findInteractionPoint)).toHaveBeenCalledWith(map, "bell")

    expect(vi.mocked(renderTileLayer)).toHaveBeenCalledWith(
      map.layers[0],
      map.tilewidth,
      map.tileheight,
      map.tilesets[0].firstgid,
      tileSpriteFactory,
      expect.any(Function),
    )

    expect(vi.mocked(renderTileLayer)).toHaveBeenCalledWith(
      map.layers[1],
      map.tilewidth,
      map.tileheight,
      map.tilesets[0].firstgid,
      tileSpriteFactory,
      expect.any(Function),
    )

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
      expect.objectContaining({ x: 10, y: 20 }),
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
