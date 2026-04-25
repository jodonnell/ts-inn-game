import type { InputAction } from "@/src/input/actions"
import type { GameWorld } from "@/src/ecs/world"
import { getActiveFixture } from "@/src/game/fixtureInteraction"
import type { RoomState } from "@/src/game/roomState"

export type FixtureCleaningInput = {
  isHeld: (action: InputAction) => boolean
}

const resetCleaningFixture = (roomState: RoomState) => {
  for (const fixture of roomState.fixtures) {
    if (fixture.state !== "cleaning") continue
    fixture.state = "dirty"
    fixture.progressMs = 0
  }
}

const decayCleaningFixture = (fixture: RoomState["fixtures"][number], dt: number) => {
  fixture.progressMs = Math.max(0, fixture.progressMs - dt * 1000)
  fixture.state = fixture.progressMs > 0 ? "cleaning" : "dirty"
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

    if (!input.isHeld("interact")) {
      if (activeFixture.state === "cleaning") {
        decayCleaningFixture(activeFixture, dt)
      }
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
