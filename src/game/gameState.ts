import { type InputState } from "@/src/ecs/systems/movement"
import type { CollisionWall } from "@/src/ecs/systems/movement"
import { type TeleportState } from "@/src/ecs/systems/teleport"
import { createGameTimeState, type GameTimeState } from "@/src/ecs/systems/time"
import { createGameWorld, type GameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
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
import { createDefaultInteractionPoint } from "@/src/game/fixtures"
import { createRoomLoader } from "@/src/game/roomLoader"
import innMap from "@/assets/maps/inn.json"
import room1Map from "@/assets/maps/room1.json"
import type { Application } from "pixi.js"
import { Container } from "pixi.js"

export type GameState = {
  app: Application
  world: GameWorld
  player: number
  input: InputState & { dispose: () => void }
  collisionWalls: CollisionWall[]
  camera: ReturnType<typeof createCameraAdapter>
  promptStore: ReturnType<typeof createPromptStore>
  timeDisplayStore: ReturnType<typeof createTimeDisplayStore>
  nightOverlayStore: ReturnType<typeof createNightOverlayStore>
  interactionPoint: ReturnType<typeof createDefaultInteractionPoint>
  teleportState: TeleportState
  gameTime: GameTimeState
  roomLoader: ReturnType<typeof createRoomLoader>
  renderStore: ReturnType<typeof createPixiRenderStore>
}

export const initializeGame = async (): Promise<GameState> => {
  const app = await createPixiApp()
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
  const collisionWalls: CollisionWall[] = []
  const camera = createCameraAdapter(app, worldContainer)
  const promptStore = createPromptStore(worldContainer)
  const timeDisplayStore = createTimeDisplayStore(uiContainer)
  const nightOverlayStore = createNightOverlayStore(overlayContainer)
  const interactionPoint = createDefaultInteractionPoint()
  const teleportState: TeleportState = { zones: [] }
  const gameTime = createGameTimeState()
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
    collisionWalls,
    interactionPoint,
    teleportState,
  })
  roomLoader("inn")

  return {
    app,
    world,
    player,
    input,
    collisionWalls,
    camera,
    promptStore,
    timeDisplayStore,
    nightOverlayStore,
    interactionPoint,
    teleportState,
    gameTime,
    roomLoader,
    renderStore,
  }
}
