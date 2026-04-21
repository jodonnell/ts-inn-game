import { Position } from "@/src/ecs/components"
import type { GameWorld } from "@/src/ecs/world"
import {
  getFixtureInteractionPoint,
  isWithinInteractionRange,
} from "@/src/game/fixtureInteraction"
import type { RoomFixture, RoomState } from "@/src/game/roomState"

export const createFixtureTargetingSystem =
  (player: number, roomState: RoomState) => (_world: GameWorld, _dt: number) => {
    void _world
    void _dt

    const playerX = Position.x[player]
    const playerY = Position.y[player]
    let closestFixture: RoomFixture | null = null
    let closestDistance = Number.POSITIVE_INFINITY

    for (const fixture of roomState.fixtures) {
      if (fixture.state === "clean") continue
      const interaction = getFixtureInteractionPoint(fixture)
      if (!isWithinInteractionRange(playerX, playerY, interaction)) continue
      const dx = interaction.x - playerX
      const dy = interaction.y - playerY
      const distance = Math.hypot(dx, dy)
      if (distance >= closestDistance) continue
      closestFixture = fixture
      closestDistance = distance
    }

    roomState.setActiveFixtureId(closestFixture?.id ?? null)
  }
