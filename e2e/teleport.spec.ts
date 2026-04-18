import { expect, test } from "@playwright/test"
import {
  getCurrentMapKey,
  getPlayerPosition,
  gotoGame,
  holdKeyUntil,
} from "@/e2e/helpers/gameTestApi"

test("teleports to the requested room", async ({ page }) => {
  await gotoGame(page, "teleport")
  expect(await getCurrentMapKey(page)).toBe("tiledRoom")
  expect(await getPlayerPosition(page)).toEqual({ x: 32, y: 32 })

  await holdKeyUntil(
    page,
    "ArrowRight",
    async () => (await getCurrentMapKey(page)) === "inn",
  )

  expect(await getCurrentMapKey(page)).toBe("inn")
  const endPosition = await getPlayerPosition(page)
  expect(endPosition).not.toBeNull()
  expect(endPosition?.x ?? 0).toBeGreaterThanOrEqual(224)
  expect(endPosition?.y).toBe(96)
})
