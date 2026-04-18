import { expect, type Page } from "@playwright/test"

declare global {
  interface Window {
    __gameTestApi?: {
      getCurrentMapKey?: () => string | null
      getPlayerPosition: () => { x: number; y: number }
    }
  }
}

export const gotoGame = async (page: Page, fixture: string) => {
  await page.goto(`/?e2e=1&fixture=${fixture}`)
  await page.waitForFunction(() => Boolean(window.__gameTestApi))
}

export const getPlayerPosition = async (page: Page) =>
  page.evaluate(() => window.__gameTestApi?.getPlayerPosition() ?? null)

export const getCurrentMapKey = async (page: Page) =>
  page.evaluate(() => window.__gameTestApi?.getCurrentMapKey?.() ?? null)

export const holdKeyUntil = async (
  page: Page,
  key: string,
  predicate: (
    position: { x: number; y: number } | null,
  ) => boolean | Promise<boolean>,
) => {
  await page.keyboard.down(key)
  try {
    await expect
      .poll(async () => predicate(await getPlayerPosition(page)))
      .toBe(true)
  } finally {
    await page.keyboard.up(key)
  }
}
