import { Position } from "@/src/ecs/components"
import type { GameTimeState } from "@/src/ecs/systems/time"
import type { FixtureState, RoomFixture, RoomState } from "@/src/game/roomState"

export const SAVE_VERSION = 1

export type SaveFixtureState = {
  id: string
  state: FixtureState
  progressMs: number
}

export type SavePlayerState = {
  x: number
  y: number
}

export type SaveTimeState = Pick<GameTimeState, "minutes" | "daysPassed">

export type SaveState = {
  version: typeof SAVE_VERSION
  player: SavePlayerState
  roomKey: string | null
  time: SaveTimeState
  fixtures: SaveFixtureState[]
}

type SaveSource = {
  player: number
  gameTime: SaveTimeState
  roomState: Pick<RoomState, "fixtures">
  roomLoader: {
    getCurrentMapKey: () => string | null
  }
}

const toSaveFixtureState = ({
  id,
  state,
  progressMs,
}: RoomFixture): SaveFixtureState => ({
  id,
  state,
  progressMs,
})

export const createSaveSnapshot = ({
  player,
  gameTime,
  roomState,
  roomLoader,
}: SaveSource): SaveState => ({
  version: SAVE_VERSION,
  player: {
    x: Position.x[player],
    y: Position.y[player],
  },
  roomKey: roomLoader.getCurrentMapKey(),
  time: {
    minutes: gameTime.minutes,
    daysPassed: gameTime.daysPassed,
  },
  fixtures: roomState.fixtures.map(toSaveFixtureState),
})
