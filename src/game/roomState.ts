import type { CollisionWall } from "@/src/ecs/systems/movement"
import type { TeleportState } from "@/src/ecs/systems/teleport"
import type { InteractionPoint } from "@/src/game/fixtureInteraction"
import type { FixturePlacement, TeleportZone } from "@/src/maps/tiled"
import { createDefaultInteractionPoint } from "@/src/game/fixtures"

export type FixtureState = "dirty" | "cleaning" | "clean"

export type RoomFixture = FixturePlacement & {
  state: FixtureState
  progressMs: number
}

export type RoomState = {
  collisionWalls: CollisionWall[]
  interactionPoint: InteractionPoint
  fixtures: RoomFixture[]
  activeFixtureId: string | null
  teleportState: TeleportState
  replaceCollisionWalls: (walls: CollisionWall[]) => void
  replaceInteractionPoint: (point: InteractionPoint) => void
  replaceFixtures: (fixtures: RoomFixture[]) => void
  setActiveFixtureId: (fixtureId: string | null) => void
  replaceTeleportZones: (zones: TeleportZone[]) => void
}

const replaceArray = <T>(target: T[], items: T[]) => {
  target.length = 0
  target.push(...items)
}

const copyInteractionPoint = (
  target: InteractionPoint,
  source: InteractionPoint,
) => {
  target.x = source.x
  target.y = source.y
  target.radius = source.radius
  target.offsetY = source.offsetY
  target.bounds.x = source.bounds.x
  target.bounds.y = source.bounds.y
  target.bounds.width = source.bounds.width
  target.bounds.height = source.bounds.height
}

export const createRoomState = (): RoomState => {
  const collisionWalls: CollisionWall[] = []
  const interactionPoint = createDefaultInteractionPoint()
  const fixtures: RoomFixture[] = []
  const teleportState: TeleportState = { zones: [] }
  const roomState: RoomState = {
    collisionWalls,
    interactionPoint,
    fixtures,
    activeFixtureId: null,
    teleportState,
    replaceCollisionWalls: (walls) => {
      replaceArray(collisionWalls, walls)
    },
    replaceInteractionPoint: (point) => {
      copyInteractionPoint(interactionPoint, point)
    },
    replaceFixtures: (nextFixtures) => {
      replaceArray(fixtures, nextFixtures)
      if (
        !fixtures.some((fixture) => fixture.id === roomState.activeFixtureId)
      ) {
        roomState.activeFixtureId = null
      }
    },
    setActiveFixtureId: (fixtureId) => {
      roomState.activeFixtureId = fixtureId
    },
    replaceTeleportZones: (zones) => {
      replaceArray(teleportState.zones, zones)
    },
  }

  return roomState
}
