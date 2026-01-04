import type { GameWorld } from "@/src/ecs/world"

export const MINUTES_PER_DAY = 24 * 60
export const DEFAULT_REAL_MINUTES_PER_GAME_DAY = 15

export type GameTimeState = {
  minutes: number
  daysPassed: number
}

export type GameTimeConfig = {
  realMinutesPerDay?: number
}

const normalizeMinutes = (minutes: number) =>
  ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY

export const createGameTimeState = (startMinutes = 60 * 4): GameTimeState => ({
  minutes: normalizeMinutes(startMinutes),
  daysPassed: 0,
})

const resolveGameMinutesPerSecond = (realMinutesPerDay: number) =>
  MINUTES_PER_DAY / (realMinutesPerDay * 60)

export const createTimeSystem =
  (state: GameTimeState, config: GameTimeConfig = {}) =>
  (_world: GameWorld, dt: number) => {
    void _world
    const realMinutesPerDay =
      config.realMinutesPerDay ?? DEFAULT_REAL_MINUTES_PER_GAME_DAY
    const gameMinutesPerSecond =
      resolveGameMinutesPerSecond(realMinutesPerDay)
    const nextMinutes = state.minutes + dt * gameMinutesPerSecond
    if (nextMinutes >= MINUTES_PER_DAY) {
      state.daysPassed += Math.floor(nextMinutes / MINUTES_PER_DAY)
    }
    state.minutes = normalizeMinutes(nextMinutes)
  }
