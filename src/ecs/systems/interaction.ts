import { Position } from "@/src/ecs/components"
import type { GameWorld } from "@/src/ecs/world"
import {
  getCurrentInteractionPoint,
  isWithinInteractionRange,
} from "@/src/game/fixtureInteraction"
import type { RoomState } from "@/src/game/roomState"

export type InteractionInput = {
  consumeInteraction: () => boolean
}

export type InteractionSound = {
  play: () => void
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
    if (roomState.activeFixtureId) return
    const interaction = getCurrentInteractionPoint(roomState)

    if (isWithinInteractionRange(playerX, playerY, interaction)) {
      sound.play()
    }
  }
