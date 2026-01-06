import { expect, test } from "@playwright/test"

declare global {
  interface Window {
    __audioPlayCount?: number
    __gameTestApi?: {
      movePlayerToInteraction: () => void
    }
  }
}

test("rings the bell when interacting", async ({ page }) => {
  await page.addInitScript(() => {
    window.__audioPlayCount = 0
    const originalPlay = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function (...args) {
      window.__audioPlayCount += 1
      return originalPlay.apply(this, args)
    }
    if (window.AudioBufferSourceNode?.prototype?.start) {
      const originalStart = AudioBufferSourceNode.prototype.start
      AudioBufferSourceNode.prototype.start = function (...args) {
        window.__audioPlayCount += 1
        return originalStart.apply(this, args)
      }
    }
  })

  await page.goto("/?e2e=1")
  await page.waitForTimeout(500)

  await page.waitForFunction(() => Boolean(window.__gameTestApi))
  await page.evaluate(() => window.__gameTestApi?.movePlayerToInteraction())
  await page.waitForTimeout(100)

  const playCountBefore = await page.evaluate(
    () => window.__audioPlayCount ?? 0,
  )

  await page.keyboard.press("e")

  await page.waitForFunction(
    (count) => (window.__audioPlayCount ?? 0) > count,
    playCountBefore,
  )
  const playCountAfter = await page.evaluate(() => window.__audioPlayCount ?? 0)
  expect(playCountAfter).toBeGreaterThan(playCountBefore)
})
