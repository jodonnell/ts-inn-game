import { createLoop } from "@/src/ecs/loop"
import { createGameWorld, spawnPlayer } from "@/src/ecs/world"
import { installDebugPerfOverlay } from "@/src/debug/perf"
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

  const loop = createLoop({
    world,
    systems: [createPlayerRenderSystem(player, renderStore)],
  })
  loop.start()

  return { app, world, loop }
}
