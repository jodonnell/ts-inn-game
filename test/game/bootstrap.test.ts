import { describe, expect, it, vi } from "vitest"
import { createGameLoop, startGame } from "@/src/game/bootstrap"
import { initializeGame } from "@/src/game/gameState"
import { createLoop } from "@/src/ecs/systems/loop"
import {
  createCameraAdapter,
  createCameraFollowSystem,
} from "@/src/render/camera"
import { createFixtureCleaningSystem } from "@/src/ecs/systems/fixtureCleaning"
import { createFixtureTargetingSystem } from "@/src/ecs/systems/fixtureTargeting"
import {
  createCleaningProgressStore,
  createCleaningProgressSystem,
} from "@/src/render/cleaningProgress"
import {
  createInteractionPromptSystem,
  createPromptStore,
} from "@/src/render/interactionPrompt"
import { createInteractionSystem } from "@/src/ecs/systems/interaction"
import { createFixtureRenderSystem } from "@/src/render/fixtureRender"
import { createNpcRenderSystem } from "@/src/render/npcRender"
import { createTeleportSystem } from "@/src/ecs/systems/teleport"
import { createRoomLoader } from "@/src/game/roomLoader"
import { installGameTestApi } from "@/src/game/testHooks"
import { createConversationSystem } from "@/src/game/conversation"
import { createTimeDisplayStore } from "@/src/render/timeDisplay"
import {
  createConversationDialogStore,
  createConversationDialogSystem,
} from "@/src/render/conversationDialog"
import {
  createNightOverlayStore,
  createNightOverlaySystem,
} from "@/src/render/nightOverlay"
import { createGameInputState } from "@/src/input/actions"
import { createInputFlushSystem, createInputRouter } from "@/src/input/router"
import { createPixiApp, createPixiRenderStore } from "@/src/render/pixi"
import { createGamepadInputAdapter } from "@/src/input/gamepad"
import { createKeyboardInputAdapter } from "@/src/input/keyboard"
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
const fixtureRenderSystem = vi.fn()
const npcRenderSystem = vi.fn()
const fixtureTargetingSystem = vi.fn()
const fixtureCleaningSystem = vi.fn()
const cleaningProgressSystem = vi.fn()
const cameraSystem = vi.fn()
const promptSystem = vi.fn()
const interactionSystem = vi.fn()
const conversationSystem = vi.fn()
const timeSystem = vi.fn()
const timeState = { minutes: 0 }
const timeDisplaySystem = vi.fn()
const conversationDialogSystem = vi.fn()
const nightOverlaySystem = vi.fn()
const inputFlushSystem = vi.fn()
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
const roomTmjMap = vi.hoisted(() => ({
  width: 3,
  height: 3,
  tilewidth: 32,
  tileheight: 32,
  layers: [
    {
      type: "tilelayer",
      name: "ground",
      width: 3,
      height: 3,
      data: [1, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  ],
  tilesets: [{ firstgid: 1 }],
}))
const fixtureMaps = vi.hoisted(() => ({
  inn: {
    width: 1,
    height: 1,
    tilewidth: 32,
    tileheight: 32,
    layers: [],
    tilesets: [],
  },
  room1: {
    width: 1,
    height: 1,
    tilewidth: 32,
    tileheight: 32,
    layers: [],
    tilesets: [],
  },
  hallway: {
    width: 1,
    height: 1,
    tilewidth: 32,
    tileheight: 32,
    layers: [],
    tilesets: [],
  },
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

vi.mock("@/src/input/actions", () => ({
  createGameInputState: vi.fn(() => ({
    getMovement: () => ({ x: 0, y: 0 }),
    consume: vi.fn(() => false),
    isHeld: vi.fn(() => false),
    update: vi.fn(),
    dispose: vi.fn(),
  })),
}))

vi.mock("@/src/input/router", () => ({
  createInputFlushSystem: vi.fn(() => inputFlushSystem),
  createInputRouter: vi.fn((input) => ({
    ...input,
    pushContext: vi.fn(),
    popContext: vi.fn(),
    getActiveContext: vi.fn(() => "gameplay"),
    flushQueuedActions: vi.fn(),
  })),
}))

vi.mock("@/src/input/keyboard", () => ({
  createKeyboardInputAdapter: vi.fn(() => ({
    getHeldActions: vi.fn(() => []),
    consumePressed: vi.fn(() => []),
    dispose: vi.fn(),
  })),
}))

vi.mock("@/src/input/gamepad", () => ({
  createGamepadInputAdapter: vi.fn(() => ({
    getHeldActions: vi.fn(() => []),
    consumePressed: vi.fn(() => []),
    update: vi.fn(),
    dispose: vi.fn(),
  })),
}))

vi.mock("@/src/ecs/systems/movement", () => ({
  createInputSystem: vi.fn(() => inputSystem),
  createMovementSystem: vi.fn(() => movementSystem),
}))

vi.mock("@/src/ecs/systems/fixtureTargeting", () => ({
  createFixtureTargetingSystem: vi.fn(() => fixtureTargetingSystem),
}))

vi.mock("@/src/ecs/systems/fixtureCleaning", () => ({
  createFixtureCleaningSystem: vi.fn(() => fixtureCleaningSystem),
}))

vi.mock("@/src/ecs/systems/interaction", () => ({
  createInteractionSystem: vi.fn(() => interactionSystem),
}))

vi.mock("@/src/ecs/systems/teleport", () => ({
  createTeleportSystem: vi.fn(() => teleportSystem),
}))

vi.mock("@/src/ecs/systems/time", () => ({
  createGameTimeState: vi.fn(() => timeState),
  createTimeSystem: vi.fn(() => timeSystem),
}))

vi.mock("@/src/game/conversation", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/src/game/conversation")>()
  return {
    ...actual,
    createConversationSystem: vi.fn(() => conversationSystem),
  }
})

vi.mock("@/src/render/playerRender", () => ({
  createPlayerRenderSystem: vi.fn(() => renderSystem),
}))

vi.mock("@/src/render/fixtureRender", () => ({
  createFixtureRenderSystem: vi.fn(() => fixtureRenderSystem),
}))

vi.mock("@/src/render/npcRender", () => ({
  createNpcRenderSystem: vi.fn(() => npcRenderSystem),
}))

vi.mock("@/src/render/cleaningProgress", () => ({
  createCleaningProgressStore: vi.fn(() => ({
    bar: null,
    createBar: vi.fn(),
    addBar: vi.fn(),
  })),
  createCleaningProgressSystem: vi.fn(() => cleaningProgressSystem),
}))

vi.mock("@/src/render/camera", () => ({
  createCameraAdapter: vi.fn(() => ({
    setBounds: vi.fn(),
    setPosition: vi.fn(),
    getVisibleRect: vi.fn(() => ({ x: 0, y: 0, width: 640, height: 360 })),
    isRectVisible: vi.fn(() => true),
  })),
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
  SAFE_FRAME_WIDTH: 640,
  SAFE_FRAME_HEIGHT: 360,
  createPixiApp: vi.fn(async () => ({
    app: {
      stage: {
        pivot: { x: 0, y: 0 },
        position: { x: 0, y: 0 },
        addChild: vi.fn(),
      },
      screen: { width: 800, height: 600 },
    },
    safeFrame: new Container(),
    safeFrameLayout: {
      frame: {
        width: 640,
        height: 360,
        scale: 1,
        offsetX: 80,
        offsetY: 120,
      },
      resize: vi.fn(),
    },
    destroy: vi.fn(),
  })),
  loadManagerSpritesheet: vi.fn(async () => ({})),
  loadTilesetTextures: vi.fn(async () => []),
  createPixiRenderStore: vi.fn(() => ({
    sprites: new Map(),
    createAnimatedSprite: vi.fn(),
    addSprite: vi.fn(),
    fixtureStore: {
      sprites: new Map(),
      createSprite: vi.fn(),
      addSprite: vi.fn(),
    },
    npcStore: {
      sprites: new Map(),
      createAnimatedSprite: vi.fn(),
      addSprite: vi.fn(),
      removeSprite: vi.fn(),
    },
  })),
}))

vi.mock("@/src/render/tilemap", () => ({
  createPixiMultiTilesetSpriteFactory: vi.fn(() => tileSpriteFactory),
}))

vi.mock("@/src/game/roomLoader", () => ({
  createRoomLoader: vi.fn(() => loadRoom),
}))

vi.mock("@/src/game/testHooks", () => ({
  installGameTestApi: vi.fn(),
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

vi.mock("@/src/render/conversationDialog", () => ({
  createConversationDialogStore: vi.fn(() => ({
    dialog: null,
    createDialog: vi.fn(),
    addDialog: vi.fn(),
  })),
  createConversationDialogSystem: vi.fn(() => conversationDialogSystem),
}))

vi.mock("@/assets/maps/inn.json", () => ({ default: map }))
vi.mock("@/assets/tiled/room.tmj?raw", () => ({
  default: JSON.stringify(roomTmjMap),
}))
vi.mock("@/assets/maps/room1.json", () => ({ default: map }))
vi.mock("@/assets/tiled/hallway.tmj?raw", () => ({
  default: JSON.stringify(map),
}))
vi.mock("@/assets/sfx/bell.mp3", () => ({ default: "bell.mp3" }))
vi.mock("@/src/test-fixtures/e2eMaps", () => ({
  getE2EMapFixture: vi.fn(() => fixtureMaps),
}))

vi.mock("@/src/debug/perf", () => ({
  installDebugPerfOverlay: vi.fn(),
}))

vi.mock("howler", () => ({
  Howl: class {
    play = vi.fn()
  },
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
  it("initializes the game state and loads the default room", async () => {
    await initializeGame()

    expect(vi.mocked(createGameInputState)).toHaveBeenCalledWith({
      adapters: [
        vi.mocked(createKeyboardInputAdapter).mock.results[0]?.value,
        vi.mocked(createGamepadInputAdapter).mock.results[0]?.value,
      ],
    })
    expect(vi.mocked(createInputRouter)).toHaveBeenCalledWith(
      vi.mocked(createGameInputState).mock.results[0]?.value,
    )

    expect(vi.mocked(createRoomLoader)).toHaveBeenCalledWith(
      expect.objectContaining({
        mapsByKey: { inn: map, room: roomTmjMap, room1: map, hallway: map },
        player,
        tileSpriteFactories: {
          inn: tileSpriteFactory,
          room: tileSpriteFactory,
          room1: tileSpriteFactory,
          hallway: tileSpriteFactory,
        },
      }),
    )
    expect(loadRoom).toHaveBeenCalledWith("hallway")

    expect(vi.mocked(createTimeDisplayStore)).toHaveBeenCalledWith(
      expect.any(Container),
    )
    expect(vi.mocked(createNightOverlayStore)).toHaveBeenCalledWith(
      expect.any(Container),
    )

    const [, worldContainer] = vi.mocked(createCameraAdapter).mock.calls[0]
    const [uiContainer] = vi.mocked(createTimeDisplayStore).mock.calls[0]
    const [overlayContainer] = vi.mocked(createNightOverlayStore).mock.calls[0]
    const [{ mapContainer, foregroundMapContainer }] =
      vi.mocked(createRoomLoader).mock.calls[0]
    const [, , actorContainer] = vi.mocked(createPixiRenderStore).mock.calls[0]

    expect(worldContainer).toBeInstanceOf(Container)
    expect(uiContainer).toBeInstanceOf(Container)
    expect(overlayContainer).toBeInstanceOf(Container)
    expect(mapContainer).toBeInstanceOf(Container)
    expect(foregroundMapContainer).toBeInstanceOf(Container)
    expect(actorContainer).toBeInstanceOf(Container)
    expect(uiContainer).not.toBe(worldContainer)
    expect(overlayContainer).not.toBe(worldContainer)
    expect(overlayContainer).not.toBe(uiContainer)
    expect(mapContainer).not.toBe(actorContainer)
    expect(foregroundMapContainer).not.toBe(actorContainer)

    expect(vi.mocked(createPixiRenderStore)).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      actorContainer,
    )
    expect(vi.mocked(createCleaningProgressStore)).toHaveBeenCalledWith(
      worldContainer,
    )
    expect(vi.mocked(createPromptStore)).toHaveBeenCalledWith(worldContainer)
  })

  it("mounts the HUD outside the safe frame so it stays near the viewport edge", async () => {
    await initializeGame()

    const [uiContainer] = vi.mocked(createTimeDisplayStore).mock.calls[0]
    const createPixiAppResult =
      await vi.mocked(createPixiApp).mock.results[0].value
    const { safeFrame, app } = createPixiAppResult

    expect(safeFrame.addChild).not.toHaveBeenCalledWith(uiContainer)
    expect(app.stage.addChild).toHaveBeenCalledWith(uiContainer)
  })

  it("mounts the conversation dialog inside the safe frame", async () => {
    await initializeGame()

    const [dialogContainer] = vi.mocked(createConversationDialogStore).mock
      .calls[0]
    const createPixiAppResult =
      await vi.mocked(createPixiApp).mock.results[0].value
    const { safeFrame, app } = createPixiAppResult

    expect(safeFrame.addChild).toHaveBeenCalledWith(dialogContainer)
    expect(app.stage.addChild).not.toHaveBeenCalledWith(dialogContainer)
  })

  it("uses e2e fixture maps when requested by query string", async () => {
    const originalWindow = globalThis.window
    globalThis.window = {
      location: { search: "?e2e=1&fixture=bell" },
    } as typeof window

    await initializeGame()

    expect(vi.mocked(createRoomLoader)).toHaveBeenCalledWith(
      expect.objectContaining({
        mapsByKey: fixtureMaps,
      }),
    )

    globalThis.window = originalWindow
  })

  it("wires map rendering and gameplay systems into the loop", async () => {
    const state = await initializeGame()

    createGameLoop(state)

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
      expect.objectContaining({
        interactionPoint: expect.objectContaining({
          enabled: false,
          x: 0,
          y: 0,
        }),
        fixtures: [],
      }),
    )

    expect(vi.mocked(createInteractionSystem)).toHaveBeenCalledWith(
      player,
      expect.objectContaining({
        consume: expect.any(Function),
        getMovement: expect.any(Function),
        isHeld: expect.any(Function),
        update: expect.any(Function),
        dispose: expect.any(Function),
      }),
      expect.objectContaining({
        interactionPoint: expect.objectContaining({
          enabled: false,
          x: 0,
          y: 0,
        }),
        fixtures: [],
      }),
      expect.any(Object),
      expect.objectContaining({
        startConversation: expect.any(Function),
      }),
    )

    expect(vi.mocked(createFixtureRenderSystem)).toHaveBeenCalledWith(
      expect.objectContaining({ fixtures: [] }),
      expect.objectContaining({
        sprites: expect.any(Map),
        createSprite: expect.any(Function),
        addSprite: expect.any(Function),
      }),
    )

    expect(vi.mocked(createNpcRenderSystem)).toHaveBeenCalledWith(
      expect.objectContaining({ npcs: [] }),
      expect.objectContaining({
        sprites: expect.any(Map),
        createAnimatedSprite: expect.any(Function),
        addSprite: expect.any(Function),
        removeSprite: expect.any(Function),
      }),
    )

    expect(vi.mocked(createFixtureTargetingSystem)).toHaveBeenCalledWith(
      player,
      expect.objectContaining({
        interactionPoint: expect.objectContaining({
          enabled: false,
          x: 0,
          y: 0,
        }),
        fixtures: [],
      }),
    )

    expect(vi.mocked(createFixtureCleaningSystem)).toHaveBeenCalledWith(
      player,
      expect.objectContaining({
        isHeld: expect.any(Function),
      }),
      expect.objectContaining({
        interactionPoint: expect.objectContaining({
          enabled: false,
          x: 0,
          y: 0,
        }),
        fixtures: [],
      }),
    )

    expect(vi.mocked(createCleaningProgressSystem)).toHaveBeenCalledWith(
      player,
      expect.objectContaining({
        interactionPoint: expect.objectContaining({
          enabled: false,
          x: 0,
          y: 0,
        }),
        fixtures: [],
      }),
      expect.objectContaining({
        bar: null,
        createBar: expect.any(Function),
        addBar: expect.any(Function),
      }),
    )

    expect(vi.mocked(createConversationDialogStore)).toHaveBeenCalledWith(
      expect.any(Container),
    )

    const [{ fixtureStore, npcStore }] = vi
      .mocked(createPixiRenderStore)
      .mock.results.map((result) => result.value)
    expect(vi.mocked(createFixtureRenderSystem)).toHaveBeenCalledWith(
      expect.any(Object),
      fixtureStore,
    )
    expect(vi.mocked(createNpcRenderSystem)).toHaveBeenCalledWith(
      expect.any(Object),
      npcStore,
    )

    expect(vi.mocked(createTeleportSystem)).toHaveBeenCalledWith(
      player,
      expect.objectContaining({ zones: [] }),
      expect.objectContaining({
        consume: expect.any(Function),
        getMovement: expect.any(Function),
        isHeld: expect.any(Function),
        update: expect.any(Function),
        dispose: expect.any(Function),
      }),
      loadRoom,
    )

    expect(vi.mocked(createConversationSystem)).toHaveBeenCalledWith(
      expect.objectContaining({ isOpen: false, message: "" }),
      expect.objectContaining({
        consume: expect.any(Function),
        popContext: expect.any(Function),
      }),
    )
    expect(vi.mocked(createConversationDialogSystem)).toHaveBeenCalledWith(
      expect.objectContaining({ isOpen: false, message: "" }),
      expect.objectContaining({
        dialog: null,
        createDialog: expect.any(Function),
        addDialog: expect.any(Function),
      }),
    )
    expect(vi.mocked(createInputFlushSystem)).toHaveBeenCalledWith(
      expect.objectContaining({
        flushQueuedActions: expect.any(Function),
      }),
    )

    expect(vi.mocked(createLoop)).toHaveBeenCalledWith({
      world,
      simulationDtSeconds: 1 / 60,
      simulationSystems: [
        inputSystem,
        conversationSystem,
        movementSystem,
        interactionSystem,
        teleportSystem,
        timeSystem,
        fixtureTargetingSystem,
        fixtureCleaningSystem,
        inputFlushSystem,
      ],
      renderSystems: [
        nightOverlaySystem,
        cameraSystem,
        renderSystem,
        fixtureRenderSystem,
        npcRenderSystem,
        cleaningProgressSystem,
        promptSystem,
        timeDisplaySystem,
        conversationDialogSystem,
      ],
    })
  })

  it("sizes the night overlay using the full app screen", async () => {
    const state = await initializeGame()

    createGameLoop(state)

    const [, , options] =
      vi.mocked(createNightOverlaySystem).mock.calls[0] ?? []
    expect(options.sizeProvider()).toEqual({ width: 800, height: 600 })
  })

  it("starts the loop after initialization", async () => {
    const result = await startGame()

    expect(loopStart).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      app: expect.any(Object),
      world,
      loop: result.loop,
    })
  })

  it("installs the game test api when e2e mode is enabled", async () => {
    const originalWindow = globalThis.window
    globalThis.window = {
      location: { search: "?e2e=1" },
    } as typeof window

    await startGame()

    expect(installGameTestApi).toHaveBeenCalledWith(
      expect.objectContaining({ player }),
      globalThis.window,
    )

    globalThis.window = originalWindow
  })

  it("uses the uncapped fixed-step loop in e2e mode", async () => {
    const originalWindow = globalThis.window
    globalThis.window = {
      location: { search: "?e2e=1" },
    } as typeof window

    const state = await initializeGame()

    createGameLoop(state)

    expect(vi.mocked(createLoop)).toHaveBeenLastCalledWith(
      expect.objectContaining({
        simulationDtSeconds: 1 / 120,
        scheduleFrame: expect.any(Function),
        cancelScheduledFrame: expect.any(Function),
      }),
    )

    globalThis.window = originalWindow
  })
})
