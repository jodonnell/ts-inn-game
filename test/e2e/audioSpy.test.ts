import { describe, expect, it, vi } from "vitest"
import {
  getAudioPlayCount,
  installAudioSpy,
  resetAudioPlayCount,
  waitForAudioPlayCountToIncrease,
} from "@/e2e/helpers/audioSpy"

describe("audioSpy", () => {
  it("installs the browser init script", async () => {
    const page = {
      addInitScript: vi.fn(async () => {}),
    }

    await installAudioSpy(page as never)

    expect(page.addInitScript).toHaveBeenCalledTimes(1)
    expect(page.addInitScript).toHaveBeenCalledWith(expect.any(Function))
  })

  it("reads, resets, and waits on the audio play count", async () => {
    const page = {
      evaluate: vi
        .fn()
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(undefined),
      waitForFunction: vi.fn(async () => {}),
    }

    const count = await getAudioPlayCount(page as never)
    await resetAudioPlayCount(page as never)
    await waitForAudioPlayCountToIncrease(page as never, count)

    expect(count).toBe(2)
    expect(page.evaluate).toHaveBeenNthCalledWith(1, expect.any(Function))
    expect(page.evaluate).toHaveBeenNthCalledWith(2, expect.any(Function))
    expect(page.waitForFunction).toHaveBeenCalledWith(expect.any(Function), 2)
  })
})
