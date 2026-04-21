import type { GameWorld } from "@/src/ecs/world"
import { getActiveFixture } from "@/src/game/fixtureInteraction"
import type { RoomState } from "@/src/game/roomState"

export type FixtureCleaningInput = {
  isHeld: () => boolean
}

const resetCleaningFixture = (roomState: RoomState) => {
  for (const fixture of roomState.fixtures) {
    if (fixture.state !== "cleaning") continue
    fixture.state = "dirty"
    fixture.progressMs = 0
  }
}

export const createFixtureCleaningSystem =
  (player: number, input: FixtureCleaningInput, roomState: RoomState) =>
  (_world: GameWorld, dt: number) => {
    void player
    void _world

    const activeFixture = getActiveFixture(roomState)
    if (!activeFixture) {
      resetCleaningFixture(roomState)
      return
    }

    if (!input.isHeld()) {
      resetCleaningFixture(roomState)
      return
    }

    if (activeFixture.state === "clean") return

    activeFixture.state = "cleaning"
    activeFixture.progressMs = Math.min(
      activeFixture.progressMs + dt * 1000,
      activeFixture.durationMs,
    )

    if (activeFixture.progressMs >= activeFixture.durationMs) {
      activeFixture.state = "clean"
      activeFixture.progressMs = activeFixture.durationMs
    }
  }
