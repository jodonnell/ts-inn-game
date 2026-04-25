import type { CollisionWall } from "@/src/ecs/systems/movement"
import type { InteractionPoint } from "@/src/game/fixtureInteraction"

export const createDefaultCollisionWalls = (): CollisionWall[] => [
  { x: 120, y: 240, width: 200, height: 20 },
  { x: 320, y: 80, width: 20, height: 200 },
]

export const createDisabledInteractionPoint = (): InteractionPoint => ({
  enabled: false,
  x: 0,
  y: 0,
  radius: 0,
  offsetY: 0,
  bounds: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
})
