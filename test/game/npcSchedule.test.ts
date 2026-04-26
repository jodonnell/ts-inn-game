import { describe, expect, it } from "vitest"
import {
  createManagerScheduleState,
  createNpcScheduleSystem,
} from "@/src/game/npcSchedule"
import { createGameTimeState } from "@/src/ecs/systems/time"
import { createRoomState } from "@/src/game/roomState"

describe("npc schedule", () => {
  it("walks the manager from the hallway post to the first hallway door when the day starts", () => {
    const roomState = createRoomState()
    const gameTime = createGameTimeState(4 * 60)
    const scheduleState = createManagerScheduleState()
    const system = createNpcScheduleSystem({
      gameTime,
      roomState,
      scheduleState,
      getCurrentMapKey: () => "hallway",
    })

    system({ entities: [] }, 1)

    expect(scheduleState.manager.mapKey).toBe("hallway")
    expect(scheduleState.manager.x).toBeLessThan(704)
    expect(scheduleState.manager.x).toBeGreaterThan(128)
    expect(scheduleState.manager.y).toBe(256)
    expect(roomState.npcs).toEqual([scheduleState.manager])
    expect(roomState.collisionWalls).toContainEqual({
      x: scheduleState.manager.x - 8,
      y: 248,
      width: 16,
      height: 8,
    })
  })

  it("uses the first hallway door and waits below the bed before 7:00am", () => {
    const roomState = createRoomState()
    const gameTime = createGameTimeState(4 * 60)
    const scheduleState = createManagerScheduleState()
    const system = createNpcScheduleSystem({
      gameTime,
      roomState,
      scheduleState,
      getCurrentMapKey: () => "room",
    })

    system({ entities: [] }, 10)
    system({ entities: [] }, 10)

    expect(scheduleState.manager).toEqual(
      expect.objectContaining({
        mapKey: "room",
        x: 448,
        y: 320,
      }),
    )
    expect(roomState.npcs).toEqual([scheduleState.manager])
  })

  it("returns the manager to the hallway post after 5:30am", () => {
    const roomState = createRoomState()
    const gameTime = createGameTimeState(5 * 60 + 30)
    const scheduleState = createManagerScheduleState()
    scheduleState.manager.mapKey = "room"
    scheduleState.manager.x = 448
    scheduleState.manager.y = 320
    const system = createNpcScheduleSystem({
      gameTime,
      roomState,
      scheduleState,
      getCurrentMapKey: () => "hallway",
    })

    system({ entities: [] }, 10)
    system({ entities: [] }, 10)

    expect(scheduleState.manager).toEqual(
      expect.objectContaining({
        mapKey: "hallway",
        x: 544,
        y: 256,
      }),
    )
    expect(roomState.npcs).toEqual([scheduleState.manager])
  })

  it("stops moving the manager while they are the active npc", () => {
    const roomState = createRoomState()
    const gameTime = createGameTimeState(4 * 60)
    const scheduleState = createManagerScheduleState()
    roomState.setActiveNpcId("manager")
    const system = createNpcScheduleSystem({
      gameTime,
      roomState,
      scheduleState,
      getCurrentMapKey: () => "hallway",
    })

    system({ entities: [] }, 1)

    expect(scheduleState.manager).toEqual(
      expect.objectContaining({
        mapKey: "hallway",
        x: 544,
        y: 256,
      }),
    )
  })
})
