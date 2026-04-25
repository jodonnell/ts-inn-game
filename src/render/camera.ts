import { Position } from "@/src/ecs/components"
import type { GameWorld } from "@/src/ecs/world"
import type { Container } from "pixi.js"

type CameraViewport = {
  width: number
  height: number
}

export type CameraRect = {
  x: number
  y: number
  width: number
  height: number
}

export type CameraLike = {
  setBounds: (bounds: CameraRect) => void
  setPosition: (x: number, y: number) => void
  getVisibleRect: () => CameraRect
  isRectVisible: (rect: CameraRect) => boolean
}

export const createCameraAdapter = (
  viewport: CameraViewport,
  container: Container,
): CameraLike => {
  const visibleRect: CameraRect = {
    x: 0,
    y: 0,
    width: viewport.width,
    height: viewport.height,
  }
  let bounds: CameraRect | null = null

  const resolveVisibleOrigin = (
    center: number,
    start: number,
    size: number,
    viewportSize: number,
  ) => {
    if (size <= viewportSize) return start
    const rawOrigin = center - viewportSize / 2
    const maxOrigin = start + size - viewportSize
    return Math.min(Math.max(rawOrigin, start), maxOrigin)
  }

  const updateVisibleRect = (centerX: number, centerY: number) => {
    visibleRect.x = bounds
      ? resolveVisibleOrigin(centerX, bounds.x, bounds.width, viewport.width)
      : centerX - viewport.width / 2
    visibleRect.y = bounds
      ? resolveVisibleOrigin(centerY, bounds.y, bounds.height, viewport.height)
      : centerY - viewport.height / 2
    visibleRect.width = viewport.width
    visibleRect.height = viewport.height
  }

  const clampAxis = (
    value: number,
    start: number,
    size: number,
    viewportSize: number,
  ) => {
    if (size <= viewportSize) return start + size / 2
    const min = start + viewportSize / 2
    const max = start + size - viewportSize / 2
    return Math.min(Math.max(value, min), max)
  }

  return {
    setBounds: (nextBounds) => {
      bounds = { ...nextBounds }
    },
    setPosition: (x, y) => {
      const centerX = bounds
        ? clampAxis(x, bounds.x, bounds.width, viewport.width)
        : x
      const centerY = bounds
        ? clampAxis(y, bounds.y, bounds.height, viewport.height)
        : y

      container.pivot.x = centerX
      container.pivot.y = centerY
      container.position.x = viewport.width / 2
      container.position.y = viewport.height / 2

      updateVisibleRect(centerX, centerY)
    },
    getVisibleRect: () => ({ ...visibleRect }),
    isRectVisible: (rect) =>
      rect.x < visibleRect.x + visibleRect.width &&
      rect.x + rect.width > visibleRect.x &&
      rect.y < visibleRect.y + visibleRect.height &&
      rect.y + rect.height > visibleRect.y,
  }
}

export const createCameraFollowSystem =
  (player: number, camera: CameraLike) => (_world: GameWorld, _dt: number) => {
    void _world
    void _dt
    camera.setPosition(Position.x[player], Position.y[player])
  }
