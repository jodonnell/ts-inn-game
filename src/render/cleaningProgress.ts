import { Position } from "@/src/ecs/components"
import type { GameWorld } from "@/src/ecs/world"
import { getActiveFixture } from "@/src/game/fixtureInteraction"
import type { RoomState } from "@/src/game/roomState"
import { Container, Graphics, Text } from "pixi.js"

export type CleaningProgressBarLike = {
  x: number
  y: number
  visible: boolean
  progress: number
  container: Container
  setProgress: (progress: number) => void
}

export type CleaningProgressStore = {
  bar: CleaningProgressBarLike | null
  createBar: () => CleaningProgressBarLike
  addBar: (bar: CleaningProgressBarLike) => void
}

const ensureBar = (store: CleaningProgressStore): CleaningProgressBarLike => {
  if (store.bar) return store.bar
  const bar = store.createBar()
  store.bar = bar
  store.addBar(bar)
  return bar
}

export const createCleaningProgressStore = (
  container: Container,
): CleaningProgressStore => ({
  bar: null,
  createBar: () => {
    const root = new Container()
    const background = new Graphics()
    const fill = new Graphics()
    const label = new Text({
      text: "Cleaning",
      style: {
        fill: "#ffffff",
        fontSize: 10,
      },
    })

    label.anchor.set(0.5, 1)
    label.x = 24
    label.y = -2
    root.addChild(background)
    root.addChild(fill)
    root.addChild(label)

    const width = 48
    const height = 6
    const radius = 3

    const redraw = (progress: number) => {
      background.clear()
      background.roundRect(0, 0, width, height, radius).fill({
        color: 0x111111,
        alpha: 0.8,
      })
      fill.clear()
      fill.roundRect(0, 0, width * progress, height, radius).fill({
        color: 0x7ddc65,
        alpha: 1,
      })
    }

    redraw(0)

    const bar: CleaningProgressBarLike = {
      get x() {
        return root.x
      },
      set x(value) {
        root.x = value
      },
      get y() {
        return root.y
      },
      set y(value) {
        root.y = value
      },
      get visible() {
        return root.visible
      },
      set visible(value) {
        root.visible = value
      },
      progress: 0,
      container: root,
      setProgress: (progress) => {
        const clamped = Math.max(0, Math.min(1, progress))
        bar.progress = clamped
        redraw(clamped)
      },
    }

    root.visible = false

    return bar
  },
  addBar: (bar) => {
    container.addChild(bar.container)
  },
})

export const createCleaningProgressSystem =
  (player: number, roomState: RoomState, store: CleaningProgressStore) =>
  (_world: GameWorld, _dt: number) => {
    void _world
    void _dt

    const bar = ensureBar(store)
    const activeFixture = getActiveFixture(roomState)
    if (!activeFixture || activeFixture.state !== "cleaning") {
      bar.visible = false
      return
    }

    bar.x = Position.x[player]
    bar.y = Position.y[player] - 48
    bar.visible = true
    bar.setProgress(activeFixture.progressMs / activeFixture.durationMs)
  }
