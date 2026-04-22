import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"

const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  main?: string
  scripts?: Record<string, string>
  devDependencies?: Record<string, string>
  build?: {
    files?: string[]
    extraMetadata?: {
      main?: string
    }
    directories?: {
      output?: string
    }
  }
}

describe("electron package metadata", () => {
  it("defines the electron entrypoint and packaging script", () => {
    expect(packageJson.main).toBe("electron/main.js")
    expect(packageJson.scripts?.["build:electron"]).toBe(
      "npm run build && npm run prepare:electron-assets && electron-builder",
    )
    expect(packageJson.scripts?.["prepare:electron-assets"]).toBe(
      "mkdir -p dist/assets && cp -R assets/* dist/assets/",
    )
    expect(packageJson.scripts?.prettier).toContain("electron/**/*.js")
    expect(packageJson.scripts?.lint).toContain("electron/**/*.js")
  })

  it("includes electron builder dependencies and packaged files", () => {
    expect(packageJson.devDependencies?.electron).toBeDefined()
    expect(packageJson.devDependencies?.["electron-builder"]).toBeDefined()
    expect(packageJson.build?.files).toEqual([
      "assets/**/*",
      "dist/**/*",
      "electron/**/*",
      "package.json",
    ])
    expect(packageJson.build?.extraMetadata?.main).toBe("electron/main.js")
    expect(packageJson.build?.directories?.output).toBe("release")
  })
})
