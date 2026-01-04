import { Container, Graphics, Text } from "pixi.js"
import type { GameWorld } from "@/src/ecs/world"
import type { GameTimeState } from "@/src/ecs/systems/time"

export type TimeDisplayLike = {
  x: number
  y: number
  text: string
  visible: boolean
  container: Container
  layout?: () => void
}

export type TimeDisplayStore = {
  display: TimeDisplayLike | null
  createDisplay: () => TimeDisplayLike
  addDisplay: (display: TimeDisplayLike) => void
}

export type TimeDisplayOptions = {
  x?: number
  y?: number
  color?: string
  fontSize?: number
  backgroundColor?: number
  backgroundAlpha?: number
  padding?: number
  radius?: number
}

export const createTimeDisplayStore = (
  container: Container,
  options: TimeDisplayOptions = {},
): TimeDisplayStore => ({
  display: null,
  createDisplay: () => {
    const container = new Container()
    const background = new Graphics()
    const padding = options.padding ?? 6
    const radius = options.radius ?? 6
    const label = new Text("00:00", {
      fill: options.color ?? "#ffffff",
      fontSize: options.fontSize ?? 14,
    })
    label.anchor.set(0, 0)
    label.x = padding
    label.y = padding
    container.addChild(background)
    container.addChild(label)

    const layout = () => {
      const width = label.width + padding * 2
      const height = label.height + padding * 2
      background.clear()
      background.beginFill(
        options.backgroundColor ?? 0x111111,
        options.backgroundAlpha ?? 0.7,
      )
      background.drawRoundedRect(0, 0, width, height, radius)
      background.endFill()
    }

    layout()

    const display: TimeDisplayLike = {
      get x() {
        return container.x
      },
      set x(value) {
        container.x = value
      },
      get y() {
        return container.y
      },
      set y(value) {
        container.y = value
      },
      get visible() {
        return container.visible
      },
      set visible(value) {
        container.visible = value
      },
      get text() {
        return label.text
      },
      set text(value) {
        label.text = value
        layout()
      },
      container,
      layout,
    }

    return display
  },
  addDisplay: (display) => {
    container.addChild(display.container)
  },
})

const ensureDisplay = (store: TimeDisplayStore): TimeDisplayLike => {
  if (store.display) return store.display
  const display = store.createDisplay()
  store.display = display
  store.addDisplay(display)
  return display
}

const formatTime = (minutes: number) => {
  const totalMinutes = Math.floor(minutes) % (24 * 60)
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
}

const SEASONS = ["Spring", "Summer", "Fall", "Winter"]
const DAYS_PER_SEASON = 31
const DAYS_PER_YEAR = DAYS_PER_SEASON * SEASONS.length

const formatDate = (daysPassed: number) => {
  const normalizedDays =
    ((daysPassed % DAYS_PER_YEAR) + DAYS_PER_YEAR) % DAYS_PER_YEAR
  const seasonIndex = Math.floor(normalizedDays / DAYS_PER_SEASON)
  const dayInSeason = (normalizedDays % DAYS_PER_SEASON) + 1
  return `${SEASONS[seasonIndex]} ${dayInSeason}`
}

export const createTimeDisplaySystem =
  (
    time: GameTimeState,
    store: TimeDisplayStore,
    options: TimeDisplayOptions = {},
  ) =>
  (_world: GameWorld, _dt: number) => {
    void _world
    void _dt
    const display = ensureDisplay(store)
    display.x = options.x ?? 12
    display.y = options.y ?? 12
    display.text = `${formatDate(time.daysPassed)} ${formatTime(time.minutes)}`
    display.visible = true
    display.layout?.()
  }
