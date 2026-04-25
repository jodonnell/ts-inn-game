import type { InputAction } from "@/src/input/actions"
import { Position } from "@/src/ecs/components"
import type { GameWorld } from "@/src/ecs/world"
import type { TeleportZone } from "@/src/maps/tiled"
import { isWithinInteractionRange } from "@/src/game/fixtureInteraction"

const TELEPORT_INTERACTION_RADIUS = 32

export type TeleportState = {
  zones: TeleportZone[]
  wasInside?: boolean
}

export type TeleportHandler = (targetMapKey: string, spawnId?: string) => void
export type TeleportInput = {
  consume: (action: InputAction) => boolean
}

const isInsideZone = (x: number, y: number, zone: TeleportZone) =>
  x >= zone.x &&
  x <= zone.x + zone.width &&
  y >= zone.y &&
  y <= zone.y + zone.height

const isWithinTeleportInteractionRange = (
  x: number,
  y: number,
  zone: TeleportZone,
) =>
  isWithinInteractionRange(x, y, {
    x: zone.x + zone.width / 2,
    y: zone.y + zone.height / 2,
    radius: TELEPORT_INTERACTION_RADIUS,
    bounds: {
      x: zone.x,
      y: zone.y,
      width: zone.width,
      height: zone.height,
    },
  })

export const createTeleportSystem =
  (
    player: number,
    state: TeleportState,
    input: TeleportInput,
    teleportTo: TeleportHandler,
  ) =>
  (_world: GameWorld, _dt: number) => {
    void _world
    void _dt
    const playerX = Position.x[player]
    const playerY = Position.y[player]
    const activeZone = state.zones.find((zone) =>
      zone.interactionRequired
        ? isWithinTeleportInteractionRange(playerX, playerY, zone)
        : isInsideZone(playerX, playerY, zone),
    )

    const wasInside = state.wasInside ?? false
    if (!activeZone) {
      state.wasInside = false
      return
    }

    if (activeZone.interactionRequired) {
      state.wasInside = true
      if (input.consume("interact")) {
        teleportTo(activeZone.targetMapKey, activeZone.spawnId)
      }
      return
    }

    if (!wasInside) {
      teleportTo(activeZone.targetMapKey, activeZone.spawnId)
    }

    state.wasInside = true
  }
