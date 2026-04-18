import type { Page } from "@playwright/test"

declare global {
  interface Window {
    __audioPlayCount?: number
    __audioSpyInstalled?: boolean
  }
}

const installAudioSpyScript = () => {
  window.__audioPlayCount = 0
  if (window.__audioSpyInstalled) return
  window.__audioSpyInstalled = true

  const originalPlay = HTMLMediaElement.prototype.play
  HTMLMediaElement.prototype.play = function (...args) {
    window.__audioPlayCount = (window.__audioPlayCount ?? 0) + 1
    return originalPlay.apply(this, args)
  }

  if (window.AudioBufferSourceNode?.prototype?.start) {
    const originalStart = AudioBufferSourceNode.prototype.start
    AudioBufferSourceNode.prototype.start = function (...args) {
      window.__audioPlayCount = (window.__audioPlayCount ?? 0) + 1
      return originalStart.apply(this, args)
    }
  }
}

export const installAudioSpy = async (page: Page) => {
  await page.addInitScript(installAudioSpyScript)
}

export const getAudioPlayCount = async (page: Page) =>
  page.evaluate(() => window.__audioPlayCount ?? 0)

export const resetAudioPlayCount = async (page: Page) => {
  await page.evaluate(() => {
    window.__audioPlayCount = 0
  })
}

export const waitForAudioPlayCountToIncrease = async (
  page: Page,
  count: number,
) => {
  await page.waitForFunction(
    (previousCount) => (window.__audioPlayCount ?? 0) > previousCount,
    count,
  )
}
