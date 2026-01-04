import { createLoop } from "@/src/ecs/systems/loop"
import {
  createInputSystem,
  createMovementSystem,
} from "@/src/ecs/systems/movement"
import type { CollisionWall } from "@/src/ecs/systems/movement"
import {
  createTeleportSystem,
  type TeleportState,
} from "@/src/ecs/systems/teleport"
import { createGameTimeState, createTimeSystem } from "@/src/ecs/systems/time"
import { createGameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import { installDebugPerfOverlay } from "@/src/debug/perf"
import { createKeyboardInputState } from "@/src/input/keyboard"
import {
  createCameraAdapter,
  createCameraFollowSystem,
} from "@/src/render/camera"
import {
  createInteractionPromptSystem,
  createPromptStore,
} from "@/src/render/interactionPrompt"
import { createPlayerRenderSystem } from "@/src/render/playerRender"
import { createPixiTileSpriteFactory } from "@/src/render/tilemap"
import {
  createTimeDisplayStore,
  createTimeDisplaySystem,
} from "@/src/render/timeDisplay"
import {
  createPixiApp,
  createPixiRenderStore,
  loadManagerSpritesheet,
  loadTileSheetTexture,
} from "@/src/render/pixi"
import { createDefaultInteractionPoint } from "@/src/game/fixtures"
import { createRoomLoader } from "@/src/game/roomLoader"
import innMap from "@/assets/maps/inn.json"
import room1Map from "@/assets/maps/room1.json"
import { Container } from "pixi.js"

export const startGame = async () => {
  const app = await createPixiApp()
  if (import.meta.env.DEV) installDebugPerfOverlay(app)

  const spritesheet = await loadManagerSpritesheet()
  const tilesetTexture = await loadTileSheetTexture()
  const worldContainer = new Container()
  const uiContainer = new Container()
  app.stage.addChild(worldContainer)
  app.stage.addChild(uiContainer)
  const renderStore = createPixiRenderStore(app, spritesheet, worldContainer)
  const world = createGameWorld()
  const player = spawnPlayer(world, { x: 0, y: 0 })
  const input = createKeyboardInputState()
  const collisionWalls: CollisionWall[] = []
  const camera = createCameraAdapter(app, worldContainer)
  const promptStore = createPromptStore(worldContainer)
  const timeDisplayStore = createTimeDisplayStore(uiContainer)
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

  const loop = createLoop({
    world,
    systems: [
      createInputSystem(player, input),
      createMovementSystem(player, collisionWalls),
      createTeleportSystem(player, teleportState, roomLoader),
      createTimeSystem(gameTime),
      createCameraFollowSystem(player, camera),
      createPlayerRenderSystem(player, renderStore),
      createInteractionPromptSystem(player, promptStore, interactionPoint),
      createTimeDisplaySystem(gameTime, timeDisplayStore),
    ],
  })
  loop.start()

  return { app, world, loop }
}
