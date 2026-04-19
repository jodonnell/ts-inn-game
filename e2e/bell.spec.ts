import { expect, test } from "@playwright/test"
import {
  getAudioPlayCount,
  installAudioSpy,
  waitForAudioPlayCountToIncrease,
} from "@/e2e/helpers/audioSpy"
import { getPlayerPosition, gotoGame } from "@/e2e/helpers/gameTestApi"

test("rings the bell when interacting", async ({ page }) => {
  await installAudioSpy(page)

  await gotoGame(page, "interaction")
  expect(await getPlayerPosition(page)).toEqual({ x: 32, y: 32 })

  const playCountBefore = await getAudioPlayCount(page)

  await page.keyboard.press("e")

  await waitForAudioPlayCountToIncrease(page, playCountBefore)
  const playCountAfter = await getAudioPlayCount(page)
  expect(playCountAfter).toBeGreaterThan(playCountBefore)
})
