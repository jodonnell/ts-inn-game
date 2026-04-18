import { expect, test } from "@playwright/test"

declare global {
  interface Window {
    __audioPlayCount?: number
    __gameTestApi?: {
      getPlayerPosition: () => { x: number; y: number }
      movePlayerToInteraction: () => void
      teleportTo: (mapKey: string, spawnId?: string) => boolean
    }
  }
}

const gotoGame = async (page: Parameters<typeof test>[0]["page"]) => {
  await page.goto("/?e2e=1")
  await page.waitForTimeout(500)
  await page.waitForFunction(() => Boolean(window.__gameTestApi))
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

  await gotoGame(page)
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

test("teleports to the requested spawn point", async ({ page }) => {
  await gotoGame(page)

  const teleported = await page.evaluate(() =>
    window.__gameTestApi?.teleportTo("inn", "pointA"),
  )

  expect(teleported).toBe(true)
  await expect
    .poll(() =>
      page.evaluate(() => window.__gameTestApi?.getPlayerPosition() ?? null),
    )
    .toEqual({ x: 256, y: 160 })
})
