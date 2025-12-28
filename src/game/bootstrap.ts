import { createLoop } from "@/src/ecs/loop"
import { createGameWorld, spawnPlayer } from "@/src/ecs/world"

export const startGame = () => {
  const world = createGameWorld()
  spawnPlayer(world, { x: 64, y: 64 })

  const loop = createLoop({
    world,
    systems: [],
  })
  loop.start()

  return { world, loop }
}
