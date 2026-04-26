import { type InputState } from "@/src/ecs/systems/movement"
import { createGameTimeState, type GameTimeState } from "@/src/ecs/systems/time"
import { createGameWorld, type GameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import type { FixtureCleaningInput } from "@/src/ecs/systems/fixtureCleaning"
import type {
  InteractionInput,
  InteractionSound,
} from "@/src/ecs/systems/interaction"
import { installDebugPerfOverlay } from "@/src/debug/perf"
import { createGameInputState } from "@/src/input/actions"
import { createGamepadInputAdapter } from "@/src/input/gamepad"
import { createKeyboardInputAdapter } from "@/src/input/keyboard"
import {
  createInputRouter,
  type RoutedGameInputState,
} from "@/src/input/router"
import { createCameraAdapter } from "@/src/render/camera"
import { createCleaningProgressStore } from "@/src/render/cleaningProgress"
import { createPromptStore } from "@/src/render/interactionPrompt"
import { createTimeDisplayStore } from "@/src/render/timeDisplay"
import {
  createPixiApp,
  createPixiRenderStore,
  loadFixtureTextures,
  loadTilesetTextures,
  loadManagerSpritesheet,
  SAFE_FRAME_HEIGHT,
  SAFE_FRAME_WIDTH,
  type SafeFrameLayout,
} from "@/src/render/pixi"
import { createNightOverlayStore } from "@/src/render/nightOverlay"
import { createRoomLoader } from "@/src/game/roomLoader"
import { createRoomState, type RoomState } from "@/src/game/roomState"
import {
  createConversationStarter,
  createConversationState,
} from "@/src/game/conversation"
import { createGameText, getGameLocale } from "@/src/game/localization"
import { createConversationDialogStore } from "@/src/render/conversationDialog"
import type { TiledMap } from "@/src/maps/tiled"
import innMap from "@/assets/maps/inn.json"
import roomMapJson from "@/assets/tiled/room.tmj?raw"
import room1Map from "@/assets/maps/room1.json"
import hallwayMapJson from "@/assets/tiled/hallway.tmj?raw"
import bellSfx from "@/assets/sfx/bell.mp3"
import { createPixiMultiTilesetSpriteFactory } from "@/src/render/tilemap"
import { getE2EMapFixture } from "@/src/test-fixtures/e2eMaps"
import { getFixtureAssetSources } from "@/src/render/fixtureAssets"
import type { Application } from "pixi.js"
import { Container } from "pixi.js"
import { Howl } from "howler"

export type GameState = {
  app: Application
  safeFrameLayout: SafeFrameLayout
  world: GameWorld
  player: number
  input: RoutedGameInputState & InputState & InteractionInput
  cleaningInput: FixtureCleaningInput
  camera: ReturnType<typeof createCameraAdapter>
  cleaningProgressStore: ReturnType<typeof createCleaningProgressStore>
  promptStore: ReturnType<typeof createPromptStore>
  timeDisplayStore: ReturnType<typeof createTimeDisplayStore>
  nightOverlayStore: ReturnType<typeof createNightOverlayStore>
  conversationDialogStore: ReturnType<typeof createConversationDialogStore>
  gameTime: GameTimeState
  roomState: RoomState
  roomLoader: ReturnType<typeof createRoomLoader>
  renderStore: ReturnType<typeof createPixiRenderStore>
  bellSound: InteractionSound
  conversationState: ReturnType<typeof createConversationState>
  conversationStarter: ReturnType<typeof createConversationStarter>
}

const hallwayMap = JSON.parse(hallwayMapJson) as TiledMap
const roomMap = JSON.parse(roomMapJson) as TiledMap

const getSearchParams = () => {
  if (typeof window === "undefined") return new URLSearchParams()
  return new URLSearchParams(window.location.search)
}

export const initializeGame = async (): Promise<GameState> => {
  const { app, safeFrame, safeFrameLayout } = await createPixiApp()
  if (import.meta.env.DEV) installDebugPerfOverlay(app)
  const assetBase = import.meta.env.DEV ? "../.." : "."

  const spritesheet = await loadManagerSpritesheet()
  await loadFixtureTextures(getFixtureAssetSources())
  const worldContainer = new Container()
  const dialogContainer = new Container()
  const uiContainer = new Container()
  const overlayContainer = new Container()
  safeFrame.addChild(worldContainer)
  safeFrame.addChild(dialogContainer)
  app.stage.addChild(overlayContainer)
  app.stage.addChild(uiContainer)
  const world = createGameWorld()
  const player = spawnPlayer(world, { x: 0, y: 0 })
  const rawInput = createGameInputState({
    adapters: [createKeyboardInputAdapter(), createGamepadInputAdapter()],
  })
  const input = createInputRouter(rawInput)
  const cleaningInput: FixtureCleaningInput = {
    isHeld: input.isHeld,
  }
  const camera = createCameraAdapter(
    { width: SAFE_FRAME_WIDTH, height: SAFE_FRAME_HEIGHT },
    worldContainer,
  )
  const cleaningProgressStore = createCleaningProgressStore(worldContainer)
  const promptStore = createPromptStore(worldContainer)
  const timeDisplayStore = createTimeDisplayStore(uiContainer)
  const nightOverlayStore = createNightOverlayStore(overlayContainer)
  const conversationDialogStore = createConversationDialogStore(dialogContainer)
  const gameTime = createGameTimeState()
  const roomState = createRoomState()
  const bellSound = new Howl({ src: [bellSfx] })
  const conversationState = createConversationState()
  const params = getSearchParams()
  const locale = getGameLocale(
    params.get("locale") ?? globalThis.window?.navigator?.language,
  )
  const conversationStarter = createConversationStarter(
    conversationState,
    input,
    createGameText(locale),
  )
  const mapContainer = new Container()
  const actorContainer = new Container()
  const foregroundMapContainer = new Container()
  worldContainer.addChild(mapContainer)
  worldContainer.addChild(actorContainer)
  worldContainer.addChild(foregroundMapContainer)
  const renderStore = createPixiRenderStore(app, spritesheet, actorContainer)
  const defaultMapsByKey = {
    inn: innMap,
    room: roomMap,
    room1: room1Map,
    hallway: hallwayMap,
  }
  const fixtureName = params.has("e2e") ? params.get("fixture") : null
  const mapsByKey = fixtureName
    ? (getE2EMapFixture(fixtureName) ?? defaultMapsByKey)
    : defaultMapsByKey
  const tilesetBaseByKey = {
    inn: `${assetBase}/assets/maps`,
    room: `${assetBase}/assets/tiled`,
    room1: `${assetBase}/assets/maps`,
    hallway: `${assetBase}/assets/tiled`,
  }
  const tileSpriteFactories = Object.fromEntries(
    await Promise.all(
      Object.entries(mapsByKey).map(async ([key, map]) => {
        const textures = await loadTilesetTextures({
          tilesets: map.tilesets,
          tilesetBasePath:
            tilesetBaseByKey[key as keyof typeof tilesetBaseByKey],
        })
        return [
          key,
          createPixiMultiTilesetSpriteFactory(
            textures,
            map.tilewidth,
            map.tileheight,
          ),
        ] as const
      }),
    ),
  )
  const roomLoader = createRoomLoader({
    mapsByKey,
    player,
    mapContainer,
    foregroundMapContainer,
    tileSpriteFactories,
    roomState,
    camera,
  })
  roomLoader("hallway")

  return {
    app,
    safeFrameLayout,
    world,
    player,
    input,
    cleaningInput,
    camera,
    cleaningProgressStore,
    promptStore,
    timeDisplayStore,
    nightOverlayStore,
    conversationDialogStore,
    gameTime,
    roomState,
    roomLoader,
    renderStore,
    bellSound,
    conversationState,
    conversationStarter,
  }
}
