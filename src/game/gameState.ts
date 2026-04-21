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
import { createKeyboardInputState } from "@/src/input/keyboard"
import { createCameraAdapter } from "@/src/render/camera"
import { createPromptStore } from "@/src/render/interactionPrompt"
import { createTimeDisplayStore } from "@/src/render/timeDisplay"
import {
  createPixiApp,
  createPixiRenderStore,
  loadTilesetTextures,
  loadManagerSpritesheet,
} from "@/src/render/pixi"
import { createNightOverlayStore } from "@/src/render/nightOverlay"
import { createRoomLoader } from "@/src/game/roomLoader"
import { createRoomState, type RoomState } from "@/src/game/roomState"
import innMap from "@/assets/maps/inn.json"
import room1Map from "@/assets/maps/room1.json"
import tiledRoomMap from "@/assets/tiled/room.json"
import bellSfx from "@/assets/sfx/bell.mp3"
import { createPixiMultiTilesetSpriteFactory } from "@/src/render/tilemap"
import { getE2EMapFixture } from "@/src/test-fixtures/e2eMaps"
import type { Application } from "pixi.js"
import { Container } from "pixi.js"
import { Howl } from "howler"

export type GameState = {
  app: Application
  world: GameWorld
  player: number
  input: InputState & InteractionInput & { dispose: () => void }
  cleaningInput: FixtureCleaningInput
  camera: ReturnType<typeof createCameraAdapter>
  promptStore: ReturnType<typeof createPromptStore>
  timeDisplayStore: ReturnType<typeof createTimeDisplayStore>
  nightOverlayStore: ReturnType<typeof createNightOverlayStore>
  gameTime: GameTimeState
  roomState: RoomState
  roomLoader: ReturnType<typeof createRoomLoader>
  renderStore: ReturnType<typeof createPixiRenderStore>
  bellSound: InteractionSound
}

const getSearchParams = () => {
  if (typeof window === "undefined") return new URLSearchParams()
  return new URLSearchParams(window.location.search)
}

export const initializeGame = async (): Promise<GameState> => {
  const { app } = await createPixiApp()
  if (import.meta.env.DEV) installDebugPerfOverlay(app)
  const assetBase = import.meta.env.DEV ? "../.." : "."

  const spritesheet = await loadManagerSpritesheet()
  const worldContainer = new Container()
  const overlayContainer = new Container()
  const uiContainer = new Container()
  app.stage.addChild(worldContainer)
  app.stage.addChild(overlayContainer)
  app.stage.addChild(uiContainer)
  const renderStore = createPixiRenderStore(app, spritesheet, worldContainer)
  const world = createGameWorld()
  const player = spawnPlayer(world, { x: 0, y: 0 })
  const input = createKeyboardInputState()
  const cleaningInput: FixtureCleaningInput = {
    isHeld: input.isInteractionHeld,
  }
  const camera = createCameraAdapter(app, worldContainer)
  const promptStore = createPromptStore(worldContainer)
  const timeDisplayStore = createTimeDisplayStore(uiContainer)
  const nightOverlayStore = createNightOverlayStore(overlayContainer)
  const gameTime = createGameTimeState()
  const roomState = createRoomState()
  const bellSound = new Howl({ src: [bellSfx] })
  const mapContainer = new Container()
  worldContainer.addChild(mapContainer)
  const defaultMapsByKey = {
    inn: innMap,
    room1: room1Map,
    tiledRoom: tiledRoomMap,
  }
  const params = getSearchParams()
  const fixtureName = params.has("e2e") ? params.get("fixture") : null
  const mapsByKey = fixtureName
    ? (getE2EMapFixture(fixtureName) ?? defaultMapsByKey)
    : defaultMapsByKey
  const tilesetBaseByKey = {
    inn: `${assetBase}/assets/maps`,
    room1: `${assetBase}/assets/maps`,
    tiledRoom: `${assetBase}/assets/tiled`,
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
    tileSpriteFactories,
    roomState,
  })
  roomLoader("tiledRoom")

  return {
    app,
    world,
    player,
    input,
    cleaningInput,
    camera,
    promptStore,
    timeDisplayStore,
    nightOverlayStore,
    gameTime,
    roomState,
    roomLoader,
    renderStore,
    bellSound,
  }
}
