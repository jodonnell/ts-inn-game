import { expect, test } from "@playwright/test"
import {
  getAudioPlayCount,
  installAudioSpy,
  waitForAudioPlayCountToIncrease,
} from "@/e2e/helpers/audioSpy"
import {
  getPlayerPosition,
  gotoGame,
  holdKeyUntil,
} from "@/e2e/helpers/gameTestApi"

test("rings the bell when interacting", async ({ page }) => {
  await installAudioSpy(page)

  await gotoGame(page, "interaction")
  expect(await getPlayerPosition(page)).toEqual({ x: 32, y: 32 })
  await holdKeyUntil(
    page,
    "ArrowRight",
    (position) => (position?.x ?? 0) >= 100,
  )

  const positionAfterMoving = await getPlayerPosition(page)
  expect(positionAfterMoving).not.toBeNull()
  expect(positionAfterMoving?.x ?? 0).toBeGreaterThan(32)
  expect(positionAfterMoving?.y).toBe(32)

  const playCountBefore = await getAudioPlayCount(page)

  await page.keyboard.press("e")

  await waitForAudioPlayCountToIncrease(page, playCountBefore)
  const playCountAfter = await getAudioPlayCount(page)
  expect(playCountAfter).toBeGreaterThan(playCountBefore)
})
