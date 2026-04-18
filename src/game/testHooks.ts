import { Position } from "@/src/ecs/components"
import type { RoomState } from "@/src/game/roomState"

export type GameTestState = {
  player: number
  roomState: RoomState
  roomLoader: (mapKey: string, spawnId?: string) => boolean
}

export type GameTestApi = {
  setPlayerPosition: (x: number, y: number) => void
  teleportTo: (mapKey: string, spawnId?: string) => boolean
  movePlayerToInteraction: () => void
  getPlayerPosition: () => { x: number; y: number }
}

export const createGameTestApi = (state: GameTestState): GameTestApi => ({
  setPlayerPosition: (x, y) => {
    Position.x[state.player] = x
    Position.y[state.player] = y
  },
  teleportTo: (mapKey, spawnId) => state.roomLoader(mapKey, spawnId),
  movePlayerToInteraction: () => {
    const interaction = state.roomState.interactionPoint
    Position.x[state.player] = interaction.x
    Position.y[state.player] = interaction.y
  },
  getPlayerPosition: () => ({
    x: Position.x[state.player],
    y: Position.y[state.player],
  }),
})

export const installGameTestApi = (
  state: GameTestState,
  target: { __gameTestApi?: GameTestApi },
) => {
  target.__gameTestApi = createGameTestApi(state)
}
