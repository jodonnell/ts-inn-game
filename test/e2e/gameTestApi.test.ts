import { describe, expect, it, vi } from "vitest"
import {
  getCurrentMapKey,
  getPlayerPosition,
  gotoGame,
  holdKeyUntil,
} from "@/e2e/helpers/gameTestApi"

describe("gameTestApi", () => {
  it("boots the requested fixture and waits for the test api", async () => {
    const page = {
      goto: vi.fn(async () => {}),
      waitForFunction: vi.fn(async () => {}),
    }

    await gotoGame(page as never, "teleport")

    expect(page.goto).toHaveBeenCalledWith("/?e2e=1&fixture=teleport")
    expect(page.waitForFunction).toHaveBeenCalledTimes(1)
    expect(page.waitForFunction).toHaveBeenCalledWith(expect.any(Function))
  })

  it("reads the player position and current map key", async () => {
    const page = {
      evaluate: vi
        .fn()
        .mockResolvedValueOnce({ x: 32, y: 32 })
        .mockResolvedValueOnce("inn"),
    }

    expect(await getPlayerPosition(page as never)).toEqual({ x: 32, y: 32 })
    expect(await getCurrentMapKey(page as never)).toBe("inn")
  })

  it("holds and releases a key until the predicate passes", async () => {
    const page = {
      keyboard: {
        down: vi.fn(async () => {}),
        up: vi.fn(async () => {}),
      },
      evaluate: vi.fn().mockResolvedValue({ x: 120, y: 32 }),
    }

    await holdKeyUntil(
      page as never,
      "ArrowRight",
      (position) => (position?.x ?? 0) >= 100,
    )

    expect(page.keyboard.down).toHaveBeenCalledWith("ArrowRight")
    expect(page.keyboard.up).toHaveBeenCalledWith("ArrowRight")
  })
})
