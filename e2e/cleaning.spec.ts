import { expect, test } from "@playwright/test"
import {
  getFixtureState,
  getPlayerPosition,
  gotoGame,
  movePlayerToFixture,
} from "@/e2e/helpers/gameTestApi"

test("cleans the bed fixture when holding interact", async ({ page }) => {
  await gotoGame(page)

  expect(await movePlayerToFixture(page, "bed-1")).toBe(true)
  expect(await getPlayerPosition(page)).toEqual({ x: 464, y: 304 })
  expect(await getFixtureState(page, "bed-1")).toEqual({
    state: "dirty",
    progressMs: 0,
  })

  await page.keyboard.down("e")
  try {
    await expect
      .poll(async () => getFixtureState(page, "bed-1"), { timeout: 10000 })
      .toMatchObject({
        state: "clean",
      })
  } finally {
    await page.keyboard.up("e")
  }
})
