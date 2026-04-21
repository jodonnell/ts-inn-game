import { Position } from "@/src/ecs/components"
import type { GameWorld } from "@/src/ecs/world"
import {
  getFixtureInteractionPoint,
  type RoomFixture,
  type RoomState,
} from "@/src/game/roomState"

const getDistanceToInteraction = (
  x: number,
  y: number,
  fixture: Pick<RoomFixture, "x" | "y" | "width" | "height">,
) => {
  const interaction = getFixtureInteractionPoint(fixture)
  const minX = interaction.bounds.x
  const maxX = interaction.bounds.x + interaction.bounds.width
  const minY = interaction.bounds.y
  const maxY = interaction.bounds.y + interaction.bounds.height
  const dx = Math.max(minX - x, 0, x - maxX)
  const dy = Math.max(minY - y, 0, y - maxY)
  return Math.hypot(dx, dy)
}

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
      const distance = getDistanceToInteraction(playerX, playerY, fixture)
      if (distance > interaction.radius) continue
      if (distance >= closestDistance) continue
      closestFixture = fixture
      closestDistance = distance
    }

    roomState.setActiveFixtureId(closestFixture?.id ?? null)
  }
