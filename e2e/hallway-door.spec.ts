import { expect, test } from "@playwright/test"
import {
  getCurrentMapKey,
  gotoGame,
} from "@/e2e/helpers/gameTestApi"

test("enters a bedroom when interacting with a hallway door", async ({
  page,
}) => {
  await gotoGame(page)
  expect(await getCurrentMapKey(page)).toBe("hallway")

  await page.keyboard.press("e")

  await expect
    .poll(async () => getCurrentMapKey(page))
    .toBe("room")
})
