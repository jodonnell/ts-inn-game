import { createLoop } from "@/src/ecs/systems/loop"
import {
  createInputSystem,
  createMovementSystem,
} from "@/src/ecs/systems/movement"
import { createGameWorld } from "@/src/ecs/world"
import { spawnPlayer } from "@/src/ecs/entities/player"
import { installDebugPerfOverlay } from "@/src/debug/perf"
import { createKeyboardInputState } from "@/src/input/keyboard"
import { createCameraFollowSystem } from "@/src/render/camera"
import { createInteractionPromptSystem } from "@/src/render/interactionPrompt"
import { createPlayerRenderSystem } from "@/src/render/playerRender"
import {
  createPixiApp,
  createPixiRenderStore,
  loadManagerSpritesheet,
} from "@/src/render/pixi"
import { Text } from "pixi.js"

export const startGame = async () => {
  const app = await createPixiApp()
  if (import.meta.env.DEV) installDebugPerfOverlay(app)

  const spritesheet = await loadManagerSpritesheet()
  const renderStore = createPixiRenderStore(app, spritesheet)
  const world = createGameWorld()
  const player = spawnPlayer(world, { x: 160, y: 200 })
  const input = createKeyboardInputState()
  const collisionWalls = [
    { x: 120, y: 240, width: 200, height: 20 },
    { x: 320, y: 80, width: 20, height: 200 },
  ]
  const camera = {
    setPosition: (x: number, y: number) => {
      app.stage.pivot.x = x
      app.stage.pivot.y = y
      app.stage.position.x = app.screen.width / 2
      app.stage.position.y = app.screen.height / 2
    },
  }
  const promptStore = {
    prompt: null,
    createPrompt: () => {
      const prompt = new Text("Press E", {
        fill: "#ffffff",
        fontSize: 12,
      })
      prompt.anchor.set(0.5, 1)
      return prompt
    },
    addPrompt: (prompt: Text) => {
      app.stage.addChild(prompt)
    },
  }
  const interactionPoint = { x: 200, y: 180, radius: 40, offsetY: 16 }

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
