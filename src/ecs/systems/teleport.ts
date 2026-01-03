import { Position } from "@/src/ecs/components"
import type { GameWorld } from "@/src/ecs/world"
import type { TeleportZone } from "@/src/maps/tiled"

export type TeleportState = {
  zones: TeleportZone[]
  wasInside?: boolean
}

export type TeleportHandler = (targetMapKey: string) => void

const isInsideZone = (x: number, y: number, zone: TeleportZone) =>
  x >= zone.x &&
  x <= zone.x + zone.width &&
  y >= zone.y &&
  y <= zone.y + zone.height

export const createTeleportSystem =
  (player: number, state: TeleportState, teleportTo: TeleportHandler) =>
  (_world: GameWorld, _dt: number) => {
    void _world
    void _dt
    const playerX = Position.x[player]
    const playerY = Position.y[player]
    const activeZone = state.zones.find((zone) =>
      isInsideZone(playerX, playerY, zone),
    )

    const wasInside = state.wasInside ?? false
    if (activeZone && !wasInside) {
      teleportTo(activeZone.targetMapKey)
    }

    state.wasInside = Boolean(activeZone)
  }
