import { type InputState } from "@/src/ecs/systems/movement"
import { createGameTimeState, type GameTimeState } from "@/src/ecs/systems/time"
import { createGameWorld, type GameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import type {
  InteractionInput,
  InteractionSound,
} from "@/src/ecs/systems/interaction"
import { installDebugPerfOverlay } from "@/src/debug/perf"
import { createKeyboardInputState } from "@/src/input/keyboard"
import { createCameraAdapter } from "@/src/render/camera"
import { createPromptStore } from "@/src/render/interactionPrompt"
import { createPixiTileSpriteFactory } from "@/src/render/tilemap"
import { createTimeDisplayStore } from "@/src/render/timeDisplay"
import {
  createPixiApp,
  createPixiRenderStore,
  loadManagerSpritesheet,
  loadTileSheetTexture,
} from "@/src/render/pixi"
import { createNightOverlayStore } from "@/src/render/nightOverlay"
import { createRoomLoader } from "@/src/game/roomLoader"
import { createRoomState, type RoomState } from "@/src/game/roomState"
import innMap from "@/assets/maps/inn.json"
import room1Map from "@/assets/maps/room1.json"
import bellSfx from "@/assets/sfx/bell.mp3"
import type { Application } from "pixi.js"
import { Container } from "pixi.js"
import { Howl } from "howler"

export type GameState = {
  app: Application
  world: GameWorld
  player: number
  input: InputState & InteractionInput & { dispose: () => void }
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

export const initializeGame = async (): Promise<GameState> => {
  const { app } = await createPixiApp()
  if (import.meta.env.DEV) installDebugPerfOverlay(app)

  const spritesheet = await loadManagerSpritesheet()
  const tilesetTexture = await loadTileSheetTexture()
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
  const camera = createCameraAdapter(app, worldContainer)
  const promptStore = createPromptStore(worldContainer)
  const timeDisplayStore = createTimeDisplayStore(uiContainer)
  const nightOverlayStore = createNightOverlayStore(overlayContainer)
  const gameTime = createGameTimeState()
  const roomState = createRoomState()
  const bellSound = new Howl({ src: [bellSfx] })
  const mapContainer = new Container()
  worldContainer.addChild(mapContainer)
  const tileSpriteFactory = createPixiTileSpriteFactory(
    tilesetTexture,
    innMap.tilewidth,
    innMap.tileheight,
  )
  const roomLoader = createRoomLoader({
    mapsByKey: { inn: innMap, room1: room1Map },
    player,
    mapContainer,
    tileSpriteFactory,
    roomState,
  })
  roomLoader("inn")

  return {
    app,
    world,
    player,
    input,
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
