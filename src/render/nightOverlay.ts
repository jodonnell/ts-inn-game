import type { GameWorld } from "@/src/ecs/world"
import { Graphics } from "pixi.js"
import { MINUTES_PER_DAY, type GameTimeState } from "@/src/ecs/systems/time"

export type NightOverlayLike = Graphics & {
  layout?: (width: number, height: number) => void
}

export type NightOverlayStore = {
  overlay: NightOverlayLike | null
  createOverlay: () => NightOverlayLike
  addOverlay: (overlay: NightOverlayLike) => void
}

export type NightOverlayOptions = {
  nightStartMinutes?: number
  nightEndMinutes?: number
  transitionMinutes?: number
  alpha?: number
  color?: number
  x?: number
  y?: number
  sizeProvider?: () => { width: number; height: number }
}

const DEFAULT_NIGHT_START = 20 * 60
const DEFAULT_NIGHT_END = 5 * 60
const DEFAULT_NIGHT_TRANSITION = 60
const DEFAULT_NIGHT_ALPHA = 0.6

const ensureOverlay = (store: NightOverlayStore): NightOverlayLike => {
  if (store.overlay) return store.overlay
  const overlay = store.createOverlay()
  store.overlay = overlay
  store.addOverlay(overlay)
  return overlay
}

const normalizeMinutes = (minutes: number) =>
  ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY

const diffMinutes = (from: number, to: number) => normalizeMinutes(to - from)

const resolveNightAlpha = (
  minutes: number,
  start: number,
  end: number,
  transitionMinutes: number,
) => {
  const duration = diffMinutes(start, end)
  if (duration === 0) return 1
  const distFromStart = diffMinutes(start, minutes)
  if (distFromStart >= duration) return 0
  const distToEnd = diffMinutes(minutes, end)
  const transition = Math.min(Math.max(transitionMinutes, 0), duration / 2)
  if (transition <= 0) return 1
  if (distFromStart < transition) return distFromStart / transition
  if (distToEnd < transition) return distToEnd / transition
  return 1
}

export const createNightOverlayStore = (
  container: { addChild: (child: Graphics) => void },
  options: Pick<NightOverlayOptions, "color"> = {},
): NightOverlayStore => ({
  overlay: null,
  createOverlay: () => {
    const overlay = new Graphics() as NightOverlayLike
    const color = options.color ?? 0x000000
    overlay.layout = (width: number, height: number) => {
      overlay.clear()
      overlay.beginFill(color, 1)
      overlay.drawRect(0, 0, width, height)
      overlay.endFill()
    }
    overlay.alpha = 0
    return overlay
  },
  addOverlay: (overlay) => {
    container.addChild(overlay)
  },
})

export const createNightOverlaySystem =
  (
    time: GameTimeState,
    store: NightOverlayStore,
    options: NightOverlayOptions = {},
  ) =>
  (_world: GameWorld, _dt: number) => {
    void _world
    void _dt
    const overlay = ensureOverlay(store)
    const nightStart = options.nightStartMinutes ?? DEFAULT_NIGHT_START
    const nightEnd = options.nightEndMinutes ?? DEFAULT_NIGHT_END
    const nightAlpha = options.alpha ?? DEFAULT_NIGHT_ALPHA
    const transitionMinutes =
      options.transitionMinutes ?? DEFAULT_NIGHT_TRANSITION
    const size = options.sizeProvider?.() ?? { width: 0, height: 0 }

    overlay.x = options.x ?? 0
    overlay.y = options.y ?? 0
    overlay.layout?.(size.width, size.height)
    overlay.alpha =
      resolveNightAlpha(time.minutes, nightStart, nightEnd, transitionMinutes) *
      nightAlpha
  }
