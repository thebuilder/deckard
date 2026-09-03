import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import {
  addDevCommand,
  deckPackageManager,
  fromLockfile,
  fromUserAgent,
} from "./package-manager.ts"

const scratches: string[] = []

function scratch(files: Record<string, string>): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "deckard-pm-"))

  scratches.push(directory)

  for (const [file, contents] of Object.entries(files)) {
    fs.writeFileSync(path.join(directory, file), contents)
  }

  return directory
}

afterEach(() => {
  for (const directory of scratches.splice(0)) {
    fs.rmSync(directory, { force: true, recursive: true })
  }
})

describe("fromUserAgent", () => {
  it("reads the manager and the version it announces", () => {
    expect(
      fromUserAgent("pnpm/10.18.1 npm/? node/v24.14.0 darwin arm64")
    ).toEqual({
      name: "pnpm",
      version: "10.18.1",
    })
    expect(
      fromUserAgent("npm/12.0.2 node/v24.14.0 darwin arm64 workspaces/false")
    ).toEqual({
      name: "npm",
      version: "12.0.2",
    })
  })

  it("keeps the name when the version is not a version", () => {
    expect(fromUserAgent("yarn/berry node/v24.14.0")).toEqual({
      name: "yarn",
      version: null,
    })
  })

  it("is null for anything else", () => {
    expect(fromUserAgent("")).toBeNull()
    expect(fromUserAgent("deno/2.0.0")).toBeNull()
  })
})

describe("fromLockfile", () => {
  it("names the manager that wrote the lockfile", () => {
    expect(fromLockfile(scratch({ "package-lock.json": "{}" }))).toBe("npm")
    expect(fromLockfile(scratch({ "pnpm-lock.yaml": "" }))).toBe("pnpm")
  })

  it("finds one above the directory it starts in", () => {
    const root = scratch({ "yarn.lock": "" })
    const nested = path.join(root, "a/b")

    fs.mkdirSync(nested, { recursive: true })
    expect(fromLockfile(nested)).toBe("yarn")
  })
})

describe("deckPackageManager", () => {
  it("takes the deck's packageManager field over its lockfile", () => {
    const root = scratch({
      "package-lock.json": "{}",
      "package.json": JSON.stringify({ packageManager: "pnpm@10.18.1" }),
    })

    expect(deckPackageManager(root)).toBe("pnpm")
  })

  it("falls back to the lockfile when the field is missing", () => {
    const root = scratch({
      "package-lock.json": "{}",
      "package.json": "{}",
    })

    expect(deckPackageManager(root)).toBe("npm")
  })
})

describe("addDevCommand", () => {
  it("writes the dev flag each manager takes", () => {
    expect(addDevCommand("npm", ["playwright", "pdf-lib"])).toBe(
      "npm install -D playwright pdf-lib"
    )
    expect(addDevCommand("pnpm", ["playwright"])).toBe("pnpm add -D playwright")
    expect(addDevCommand("yarn", ["pdf-lib"])).toBe("yarn add -D pdf-lib")
    expect(addDevCommand("bun", ["playwright"])).toBe("bun add -D playwright")
  })
})
