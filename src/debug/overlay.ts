export type DebugOverlay = {
  setFps: (fps: number) => void
  setPause: (stats: {
    lastMs: number
    maxMs10s: number
    count10s: number
    lastHeapDeltaBytes: number | null
  }) => void
  destroy: () => void
}

export const createDebugOverlay = (): DebugOverlay => {
  const root = document.createElement("div")
  root.setAttribute("data-debug-overlay", "true")
  root.style.position = "fixed"
  root.style.top = "8px"
  root.style.right = "8px"
  root.style.zIndex = "9999"
  root.style.padding = "6px 8px"
  root.style.borderRadius = "6px"
  root.style.background = "rgba(0, 0, 0, 0.65)"
  root.style.color = "#a6ffb6"
  root.style.fontFamily =
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
  root.style.fontSize = "12px"
  root.style.lineHeight = "1.2"
  root.style.pointerEvents = "none"
  root.style.whiteSpace = "pre"

  const fpsLine = document.createElement("div")
  fpsLine.textContent = "FPS: --"
  root.appendChild(fpsLine)

  const pauseLine = document.createElement("div")
  pauseLine.textContent = "Pause: --"
  root.appendChild(pauseLine)

  const pauseMaxLine = document.createElement("div")
  pauseMaxLine.textContent = "Pause max(10s): --"
  root.appendChild(pauseMaxLine)

  const pauseCountLine = document.createElement("div")
  pauseCountLine.textContent = "Pause count(10s): --"
  root.appendChild(pauseCountLine)

  const heapDeltaLine = document.createElement("div")
  heapDeltaLine.textContent = "Heap Δ(last): --"
  root.appendChild(heapDeltaLine)

  document.body.appendChild(root)

  return {
    setFps: (fps: number) => {
      fpsLine.textContent = `FPS: ${Math.round(fps)}`
    },
    setPause: ({ lastMs, maxMs10s, count10s, lastHeapDeltaBytes }) => {
      if (count10s === 0) {
        pauseLine.textContent = "Pause: --"
        pauseMaxLine.textContent = "Pause max(10s): --"
        pauseCountLine.textContent = "Pause count(10s): 0"
      } else {
        pauseLine.textContent = `Pause: ${lastMs.toFixed(1)}ms (last)`
        pauseMaxLine.textContent = `Pause max(10s): ${maxMs10s.toFixed(1)}ms`
        pauseCountLine.textContent = `Pause count(10s): ${count10s}`
      }
      if (lastHeapDeltaBytes === null) {
        heapDeltaLine.textContent = "Heap Δ(last): unsupported"
        return
      }

      const mb = lastHeapDeltaBytes / (1024 * 1024)
      heapDeltaLine.textContent = `Heap Δ(last): ${mb >= 0 ? "+" : ""}${mb.toFixed(
        1,
      )}MB`
    },
    destroy: () => {
      root.remove()
    },
  }
}
