import type { GameWorld } from "@/src/ecs/world"
import type { GameTimeState } from "@/src/ecs/systems/time"
import { getNpcCollisionWall } from "@/src/game/npcs"
import type { RoomNpc, RoomState } from "@/src/game/roomState"

const MANAGER_SPEED = 120
const RETURN_TO_HALLWAY_MINUTES = 5 * 60 + 30

const HALLWAY_FIRST_DOOR = { mapKey: "hallway", x: 128, y: 256 }
const HALLWAY_POST = { mapKey: "hallway", x: 544, y: 256 }
const ROOM_DOOR = { mapKey: "room", x: 288, y: 256 }
const ROOM_BED_SIDE = { mapKey: "room", x: 448, y: 320 }

type NpcTarget = {
  mapKey: string
  x: number
  y: number
}

export type ManagerScheduleState = {
  manager: RoomNpc
  lastCollisionWall?: ReturnType<typeof getNpcCollisionWall>
}

export type NpcScheduleOptions = {
  gameTime: GameTimeState
  roomState: RoomState
  scheduleState: ManagerScheduleState
  getCurrentMapKey: () => string | null
}

export const createManagerScheduleState = (): ManagerScheduleState => ({
  manager: {
    id: "manager",
    name: "Manager",
    mapKey: HALLWAY_POST.mapKey,
    x: HALLWAY_POST.x,
    y: HALLWAY_POST.y,
    width: 32,
    height: 32,
  },
})

const isAtTarget = (npc: RoomNpc, target: NpcTarget) =>
  npc.mapKey === target.mapKey && npc.x === target.x && npc.y === target.y

const moveToward = (npc: RoomNpc, target: NpcTarget, distance: number) => {
  if (npc.mapKey !== target.mapKey) {
    npc.mapKey = target.mapKey
    npc.x = target.x
    npc.y = target.y
    return
  }

  const dx = target.x - npc.x
  const dy = target.y - npc.y
  const remaining = Math.hypot(dx, dy)
  if (remaining <= distance) {
    npc.x = target.x
    npc.y = target.y
    return
  }

  npc.x += (dx / remaining) * distance
  npc.y += (dy / remaining) * distance
}

const removePreviousNpcWall = (
  roomState: RoomState,
  state: ManagerScheduleState,
) => {
  if (!state.lastCollisionWall) return roomState.collisionWalls
  return roomState.collisionWalls.filter(
    (wall) =>
      wall.x !== state.lastCollisionWall?.x ||
      wall.y !== state.lastCollisionWall?.y ||
      wall.width !== state.lastCollisionWall?.width ||
      wall.height !== state.lastCollisionWall?.height,
  )
}

const projectManagerIntoCurrentRoom = (
  roomState: RoomState,
  state: ManagerScheduleState,
  currentMapKey: string | null,
) => {
  const baseWalls = removePreviousNpcWall(roomState, state)

  if (state.manager.mapKey !== currentMapKey) {
    roomState.replaceNpcs([])
    roomState.replaceCollisionWalls(baseWalls)
    state.lastCollisionWall = undefined
    return
  }

  const wall = getNpcCollisionWall(state.manager)
  roomState.replaceNpcs([state.manager])
  roomState.replaceCollisionWalls([...baseWalls, wall])
  state.lastCollisionWall = wall
}

const updateManagerSchedule = (
  state: ManagerScheduleState,
  gameTime: GameTimeState,
  dt: number,
) => {
  const manager = state.manager
  const distance = MANAGER_SPEED * dt

  if (gameTime.minutes < RETURN_TO_HALLWAY_MINUTES) {
    if (
      manager.mapKey === "hallway" &&
      !isAtTarget(manager, HALLWAY_FIRST_DOOR)
    ) {
      moveToward(manager, HALLWAY_FIRST_DOOR, distance)
      return
    }

    if (isAtTarget(manager, HALLWAY_FIRST_DOOR)) {
      manager.mapKey = ROOM_DOOR.mapKey
      manager.x = ROOM_DOOR.x
      manager.y = ROOM_DOOR.y
    }

    moveToward(manager, ROOM_BED_SIDE, distance)
    return
  }

  if (manager.mapKey === "room" && !isAtTarget(manager, ROOM_DOOR)) {
    moveToward(manager, ROOM_DOOR, distance)
    return
  }

  if (isAtTarget(manager, ROOM_DOOR)) {
    manager.mapKey = HALLWAY_FIRST_DOOR.mapKey
    manager.x = HALLWAY_FIRST_DOOR.x
    manager.y = HALLWAY_FIRST_DOOR.y
  }

  moveToward(manager, HALLWAY_POST, distance)
}

export const createNpcScheduleSystem =
  ({
    gameTime,
    roomState,
    scheduleState,
    getCurrentMapKey,
  }: NpcScheduleOptions) =>
  (world: GameWorld, dt: number) => {
    void world
    if (roomState.activeNpcId !== scheduleState.manager.id) {
      updateManagerSchedule(scheduleState, gameTime, dt)
    }
    projectManagerIntoCurrentRoom(roomState, scheduleState, getCurrentMapKey())
  }
