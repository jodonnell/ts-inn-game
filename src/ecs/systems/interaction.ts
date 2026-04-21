import { Position } from "@/src/ecs/components"
import type { GameWorld } from "@/src/ecs/world"
import type { RoomState } from "@/src/game/roomState"

export type InteractionInput = {
  consumeInteraction: () => boolean
}

export type InteractionSound = {
  play: () => void
}

const isWithinRange = (
  x: number,
  y: number,
  interaction: RoomState["interactionPoint"],
) => {
  const minX = interaction.bounds.x
  const maxX = interaction.bounds.x + interaction.bounds.width
  const minY = interaction.bounds.y
  const maxY = interaction.bounds.y + interaction.bounds.height
  const dx = Math.max(minX - x, 0, x - maxX)
  const dy = Math.max(minY - y, 0, y - maxY)
  return Math.hypot(dx, dy) <= interaction.radius
}

export const createInteractionSystem =
  (
    player: number,
    input: InteractionInput,
    roomState: RoomState,
    sound: InteractionSound,
  ) =>
  (_world: GameWorld, _dt: number) => {
    void _world
    void _dt
    if (!input.consumeInteraction()) return

    const playerX = Position.x[player]
    const playerY = Position.y[player]
    const interaction = roomState.interactionPoint

    if (isWithinRange(playerX, playerY, interaction)) {
      sound.play()
    }
  }
