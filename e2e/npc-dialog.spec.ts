import { expect, test } from "@playwright/test"
import {
  getCurrentMapKey,
  getConversation,
  gotoGame,
  setPlayerPosition,
} from "@/e2e/helpers/gameTestApi"

test("shows npc response choices after the manager greeting", async ({
  page,
}) => {
  await gotoGame(page)

  await setPlayerPosition(page, 352, 288)

  await page.keyboard.press("e")

  await expect.poll(async () => getConversation(page)).toEqual({
    isOpen: true,
    message:
      "Chief: I'm so hungry for lunch maybe I'll eat some chocolate covered almonds with a 10oz whiskey to wash it down!",
  })

  await page.keyboard.press("e")

  await expect.poll(async () => getConversation(page)).toEqual({
    isOpen: true,
    message: [
      "> Maybe you should eat some vegetables and row!",
      "  Chief anything you do I am 100% in favor of!",
    ].join("\n"),
  })

  await page.keyboard.press("ArrowDown")

  await expect.poll(async () => getConversation(page)).toEqual({
    isOpen: true,
    message: [
      "  Maybe you should eat some vegetables and row!",
      "> Chief anything you do I am 100% in favor of!",
    ].join("\n"),
  })

  await page.keyboard.press("e")

  await expect.poll(async () => getConversation(page)).toEqual({
    isOpen: true,
    message: "Chief: Thank u bubby, treat me gentle!  *Gulp gulp gulp*",
  })

  await page.keyboard.press("e")

  await expect.poll(async () => getConversation(page)).toEqual({
    isOpen: false,
    message: "",
  })
})

test("does not replay an old interact press at a hallway door", async ({
  page,
}) => {
  await gotoGame(page)

  await setPlayerPosition(page, 32, 32)
  await page.keyboard.press("e")
  await page.waitForTimeout(250)
  await setPlayerPosition(page, 128, 224)
  await page.waitForTimeout(250)

  expect(await getCurrentMapKey(page)).toBe("hallway")
})
