import { createLoop } from "@/src/ecs/systems/loop"
import {
  createInputSystem,
  createMovementSystem,
} from "@/src/ecs/systems/movement"
import { createGameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import { installDebugPerfOverlay } from "@/src/debug/perf"
import { createKeyboardInputState } from "@/src/input/keyboard"
import { createPlayerRenderSystem } from "@/src/render/playerRender"
import {
  createPixiApp,
  createPixiRenderStore,
  loadManagerSpritesheet,
} from "@/src/render/pixi"

export const startGame = async () => {
  const app = await createPixiApp()
  if (import.meta.env.DEV) installDebugPerfOverlay(app)

  const spritesheet = await loadManagerSpritesheet()
  const renderStore = createPixiRenderStore(app, spritesheet)
  const world = createGameWorld()
  const player = spawnPlayer(world, { x: 160, y: 200 })
  const input = createKeyboardInputState()

  const loop = createLoop({
    world,
    systems: [
      createInputSystem(player, input),
      createMovementSystem(player),
      createPlayerRenderSystem(player, renderStore),
    ],
  })
  loop.start()

  return { app, world, loop }
}
