import type { Application } from "pixi.js"
import { createDebugOverlay } from "@/src/debug/overlay"

export const installDebugPerfOverlay = (app: Application): (() => void) => {
  const overlay = createDebugOverlay()

  type PauseEvent = { at: number; durationMs: number }
  const pauseEvents: PauseEvent[] = []

  const pauseThresholdMs = 50
  const windowMs = 10_000
  const overlayUpdateEveryMs = 250

  const readUsedHeapSize = (): number | null => {
    const anyPerformance = performance as Performance & {
      memory?: { usedJSHeapSize?: number }
    }
    return anyPerformance.memory?.usedJSHeapSize ?? null
  }

  let lastHeapBytes = readUsedHeapSize()
  let lastFrameHeapDeltaBytes: number | null = null
  let lastOverlayUpdatedAt = 0

  const pruneOld = (now: number) => {
    const cutoff = now - windowMs
    while (pauseEvents.length > 0 && pauseEvents[0]!.at < cutoff)
      pauseEvents.shift()
  }

  const updateOverlay = (ticker: { FPS: number }, now: number) => {
    pruneOld(now)

    overlay.setFps(ticker.FPS)

    const count10s = pauseEvents.length
    const maxMs10s = pauseEvents.reduce(
      (max, e) => Math.max(max, e.durationMs),
      0,
    )
    const lastPauseMs = pauseEvents[count10s - 1]?.durationMs ?? 0

    overlay.setPause({
      lastMs: lastPauseMs,
      maxMs10s,
      count10s,
      lastHeapDeltaBytes: lastFrameHeapDeltaBytes,
    })
  }

  const onTick = (ticker: { FPS: number; elapsedMS: number }) => {
    const now = performance.now()

    const heapBytes = readUsedHeapSize()
    if (heapBytes !== null && lastHeapBytes !== null) {
      lastFrameHeapDeltaBytes = heapBytes - lastHeapBytes
    } else {
      lastFrameHeapDeltaBytes = null
    }
    lastHeapBytes = heapBytes

    if (ticker.elapsedMS >= pauseThresholdMs) {
      pauseEvents.push({ at: now, durationMs: ticker.elapsedMS })
    }

    if (now - lastOverlayUpdatedAt < overlayUpdateEveryMs) return
    lastOverlayUpdatedAt = now
    updateOverlay(ticker, now)
  }

  app.ticker.add(onTick)
  updateOverlay(app.ticker, performance.now())

  return () => {
    app.ticker.remove(onTick)
    overlay.destroy()
  }
}
