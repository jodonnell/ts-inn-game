import { expect, type Page } from "@playwright/test"

declare global {
  interface Window {
    __gameTestApi?: {
      getCurrentMapKey?: () => string | null
      getConversation?: () => { isOpen: boolean; message: string }
      getFixtureState?: (
        fixtureId: string,
      ) => { state: "dirty" | "cleaning" | "clean"; progressMs: number } | null
      getPlayerPosition: () => { x: number; y: number }
      movePlayerToFixture?: (fixtureId: string) => boolean
      movePlayerToNpc?: (npcId: string) => boolean
    }
  }
}

export const gotoGame = async (page: Page, fixture?: string) => {
  const search = fixture ? `?e2e=1&fixture=${fixture}` : "?e2e=1"
  await page.goto(`/${search}`)
  await page.waitForFunction(() => Boolean(window.__gameTestApi))
}

export const getPlayerPosition = async (page: Page) =>
  page.evaluate(() => window.__gameTestApi?.getPlayerPosition() ?? null)

export const setPlayerPosition = async (page: Page, x: number, y: number) =>
  page.evaluate(
    (position) =>
      window.__gameTestApi?.setPlayerPosition(position.x, position.y),
    { x, y },
  )

export const getCurrentMapKey = async (page: Page) =>
  page.evaluate(() => window.__gameTestApi?.getCurrentMapKey?.() ?? null)

export const movePlayerToFixture = async (page: Page, fixtureId: string) =>
  page.evaluate(
    (id) => window.__gameTestApi?.movePlayerToFixture?.(id) ?? false,
    fixtureId,
  )

export const movePlayerToNpc = async (page: Page, npcId: string) =>
  page.evaluate(
    (id) => window.__gameTestApi?.movePlayerToNpc?.(id) ?? false,
    npcId,
  )

export const getFixtureState = async (page: Page, fixtureId: string) =>
  page.evaluate(
    (id) => window.__gameTestApi?.getFixtureState?.(id) ?? null,
    fixtureId,
  )

export const getConversation = async (page: Page) =>
  page.evaluate(() => window.__gameTestApi?.getConversation?.() ?? null)

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
