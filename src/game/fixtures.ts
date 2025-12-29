import type { CollisionWall } from "@/src/ecs/systems/movement"
import type { InteractionPoint } from "@/src/render/interactionPrompt"

export const createDefaultCollisionWalls = (): CollisionWall[] => [
  { x: 120, y: 240, width: 200, height: 20 },
  { x: 320, y: 80, width: 20, height: 200 },
]

export const createDefaultInteractionPoint = (): InteractionPoint => ({
  x: 200,
  y: 180,
  radius: 40,
  offsetY: 16,
  bounds: {
    x: 184,
    y: 164,
    width: 32,
    height: 32,
  },
})
