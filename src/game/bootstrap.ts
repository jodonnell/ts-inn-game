import { createLoop } from "@/src/ecs/systems/loop"
import {
  createInputSystem,
  createMovementSystem,
} from "@/src/ecs/systems/movement"
import { createGameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import { installDebugPerfOverlay } from "@/src/debug/perf"
import { createKeyboardInputState } from "@/src/input/keyboard"
import type { TiledTileLayer } from "@/src/maps/tiled"
import {
  extractCollisionWalls,
  findInteractionPoint,
  findSpawnPoint,
} from "@/src/maps/tiled"
import {
  createCameraAdapter,
  createCameraFollowSystem,
} from "@/src/render/camera"
import {
  createInteractionPromptSystem,
  createPromptStore,
} from "@/src/render/interactionPrompt"
import { createPlayerRenderSystem } from "@/src/render/playerRender"
import {
  createPixiTileSpriteFactory,
  renderTileLayer,
} from "@/src/render/tilemap"
import {
  createPixiApp,
  createPixiRenderStore,
  loadManagerSpritesheet,
  loadTileSheetTexture,
} from "@/src/render/pixi"
import {
  createDefaultCollisionWalls,
  createDefaultInteractionPoint,
} from "@/src/game/fixtures"
import innMap from "@/assets/maps/inn.json"
import { Container } from "pixi.js"

export const startGame = async () => {
  const app = await createPixiApp()
  if (import.meta.env.DEV) installDebugPerfOverlay(app)

  const map = innMap
  const spritesheet = await loadManagerSpritesheet()
  const tilesetTexture = await loadTileSheetTexture()
  const renderStore = createPixiRenderStore(app, spritesheet)
  const world = createGameWorld()
  const spawn = findSpawnPoint(map, "player_spawn") ?? { x: 160, y: 200 }
  const player = spawnPlayer(world, spawn)
  const input = createKeyboardInputState()
  const mapWalls = extractCollisionWalls(map)
  const collisionWalls =
    mapWalls.length > 0 ? mapWalls : createDefaultCollisionWalls()
  const camera = createCameraAdapter(app)
  const promptStore = createPromptStore(app)
  const interactionPoint =
    findInteractionPoint(map, "bell") ?? createDefaultInteractionPoint()
  const mapContainer = new Container()
  app.stage.addChild(mapContainer)
  const tileLayers = map.layers.filter(
    (layer): layer is TiledTileLayer => layer.type === "tilelayer",
  )
  const firstGid = map.tilesets[0]?.firstgid ?? 1
  const tileSpriteFactory = createPixiTileSpriteFactory(
    tilesetTexture,
    map.tilewidth,
    map.tileheight,
  )
  const groundLayer = tileLayers.find((layer) => layer.name === "ground")
  const decorLayer = tileLayers.find((layer) => layer.name === "decor")
  if (groundLayer) {
    renderTileLayer(
      groundLayer,
      map.tilewidth,
      map.tileheight,
      firstGid,
      tileSpriteFactory,
      (sprite) => mapContainer.addChild(sprite),
    )
  }
  if (decorLayer) {
    renderTileLayer(
      decorLayer,
      map.tilewidth,
      map.tileheight,
      firstGid,
      tileSpriteFactory,
      (sprite) => mapContainer.addChild(sprite),
    )
  }

  const loop = createLoop({
    world,
    systems: [
      createInputSystem(player, input),
      createMovementSystem(player, collisionWalls),
      createCameraFollowSystem(player, camera),
      createPlayerRenderSystem(player, renderStore),
      createInteractionPromptSystem(player, promptStore, interactionPoint),
    ],
  })
  loop.start()

  return { app, world, loop }
}
