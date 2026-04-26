import { Position } from "@/src/ecs/components"
import { getFixtureInteractionPoint } from "@/src/game/fixtureInteraction"
import { getNpcInteractionPoint } from "@/src/game/npcInteraction"
import type { ConversationState } from "@/src/game/conversation"
import type { RoomState } from "@/src/game/roomState"
import type { FixtureState } from "@/src/game/roomState"

export type GameTestState = {
  player: number
  roomState: RoomState
  roomLoader: {
    (mapKey: string, spawnId?: string): boolean
    getCurrentMapKey: () => string | null
  }
  conversationState?: ConversationState
}

export type GameTestApi = {
  setPlayerPosition: (x: number, y: number) => void
  teleportTo: (mapKey: string, spawnId?: string) => boolean
  movePlayerToInteraction: () => void
  movePlayerToFixture: (fixtureId: string) => boolean
  movePlayerToNpc: (npcId: string) => boolean
  getPlayerPosition: () => { x: number; y: number }
  getConversation: () => { isOpen: boolean; message: string }
  getFixtureState: (
    fixtureId: string,
  ) => { state: FixtureState; progressMs: number } | null
  getCurrentMapKey: () => string | null
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
  movePlayerToFixture: (fixtureId) => {
    const fixture =
      state.roomState.fixtures.find((item) => item.id === fixtureId) ?? null
    if (!fixture) return false
    const interaction = getFixtureInteractionPoint(fixture)
    Position.x[state.player] = interaction.x
    Position.y[state.player] = interaction.y
    return true
  },
  movePlayerToNpc: (npcId) => {
    const npc = state.roomState.npcs.find((item) => item.id === npcId) ?? null
    if (!npc) return false
    const interaction = getNpcInteractionPoint(npc)
    Position.x[state.player] = interaction.x
    Position.y[state.player] = interaction.y
    return true
  },
  getPlayerPosition: () => ({
    x: Position.x[state.player],
    y: Position.y[state.player],
  }),
  getConversation: () => ({
    isOpen: state.conversationState?.isOpen ?? false,
    message: state.conversationState?.message ?? "",
  }),
  getFixtureState: (fixtureId) => {
    const fixture =
      state.roomState.fixtures.find((item) => item.id === fixtureId) ?? null
    if (!fixture) return null
    return {
      state: fixture.state,
      progressMs: fixture.progressMs,
    }
  },
  getCurrentMapKey: () => state.roomLoader.getCurrentMapKey(),
})

export const installGameTestApi = (
  state: GameTestState,
  target: { __gameTestApi?: GameTestApi },
) => {
  target.__gameTestApi = createGameTestApi(state)
}
