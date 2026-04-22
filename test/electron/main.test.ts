import { afterEach, describe, expect, it, vi } from "vitest"

type BrowserWindowMock = {
  loadURL: ReturnType<typeof vi.fn>
  once: ReturnType<typeof vi.fn>
  show: ReturnType<typeof vi.fn>
  webContents: {
    openDevTools: ReturnType<typeof vi.fn>
    on: ReturnType<typeof vi.fn>
  }
}

const createElectronMocks = () => {
  const mainWindow: BrowserWindowMock = {
    loadURL: vi.fn(() => Promise.resolve()),
    once: vi.fn(),
    show: vi.fn(),
    webContents: {
      openDevTools: vi.fn(),
      on: vi.fn(),
    },
  }

  const browserWindowConstructor = vi.fn(function BrowserWindow() {
    return mainWindow
  })
  const getAllWindows = vi.fn(() => [])
  const app = {
    isPackaged: false,
    whenReady: vi.fn(() => Promise.resolve()),
    on: vi.fn(),
    quit: vi.fn(),
    getAppPath: vi.fn(() => "/app"),
  }
  const protocol = {
    registerSchemesAsPrivileged: vi.fn(),
    registerFileProtocol: vi.fn(),
  }

  return {
    mainWindow,
    BrowserWindow: Object.assign(browserWindowConstructor, {
      getAllWindows,
    }),
    app,
    protocol,
  }
}

describe("electron main process", () => {
  afterEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it("loads the Vite dev server URL when running unpackaged", async () => {
    const mocks = createElectronMocks()
    vi.doMock("electron", () => mocks)
    vi.stubEnv("VITE_DEV_SERVER_URL", "http://localhost:4242")

    await import("../../electron/main.js")
    await Promise.resolve()

    expect(mocks.BrowserWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 1280,
        height: 720,
        backgroundColor: "#000000",
        show: false,
        webPreferences: {
          contextIsolation: true,
        },
      }),
    )
    expect(mocks.mainWindow.loadURL).toHaveBeenCalledWith(
      "http://localhost:4242",
    )
    expect(mocks.mainWindow.webContents.openDevTools).toHaveBeenCalledWith({
      mode: "detach",
    })
  })

  it("registers the packaged app protocol and loads the packaged build", async () => {
    const mocks = createElectronMocks()
    mocks.app.isPackaged = true
    vi.doMock("electron", () => mocks)

    await import("../../electron/main.js")
    await Promise.resolve()

    expect(mocks.protocol.registerSchemesAsPrivileged).toHaveBeenCalledWith([
      expect.objectContaining({
        scheme: "app",
      }),
    ])
    expect(mocks.protocol.registerFileProtocol).toHaveBeenCalledWith(
      "app",
      expect.any(Function),
    )
    expect(mocks.mainWindow.loadURL).toHaveBeenCalledWith(
      "app://dist/index.html",
    )
    expect(mocks.mainWindow.webContents.openDevTools).not.toHaveBeenCalled()
  })
})
