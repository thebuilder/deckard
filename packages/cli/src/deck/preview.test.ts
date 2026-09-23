import { spawn, spawnSync } from "node:child_process"
import { EventEmitter } from "node:events"
import process from "node:process"

import { afterEach, describe, expect, it, vi } from "vitest"

import { resolveFromProject } from "../project.ts"
import { previewProfile, withCanvasSession } from "./preview.ts"

vi.mock("node:child_process", () => ({
  spawn: vi.fn(),
  spawnSync: vi.fn(),
}))

vi.mock("../project.ts", () => ({
  projectRoot: "C:\\My decks\\demo",
  resolveFromProject: vi.fn(),
}))

const entry = "C:\\My decks\\demo\\node_modules\\next\\dist\\bin\\next"
const options = {
  colorMode: "light" as const,
  port: 4567,
  profile: previewProfile,
  skipBuild: false,
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetAllMocks()
  vi.unstubAllGlobals()
})

describe("Next process launch", () => {
  it("builds with Node and the deck's resolved Next entry point", async () => {
    vi.mocked(resolveFromProject).mockReturnValue(entry)
    vi.mocked(spawnSync).mockReturnValue({ status: 1 } as ReturnType<
      typeof spawnSync
    >)

    await expect(withCanvasSession(options, vi.fn())).rejects.toThrow(
      "next build failed"
    )

    expect(resolveFromProject).toHaveBeenCalledWith("next/dist/bin/next")
    expect(spawnSync).toHaveBeenCalledWith(process.execPath, [entry, "build"], {
      cwd: "C:\\My decks\\demo",
      env: process.env,
      stdio: "inherit",
    })
  })

  it("starts the preview through Node when reusing a build", async () => {
    vi.mocked(resolveFromProject).mockReturnValue(entry)
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Not serving")))
    vi.spyOn(process, "once").mockReturnValue(process)
    const child = Object.assign(new EventEmitter(), { kill: vi.fn() })
    vi.mocked(spawn).mockImplementation(() => {
      queueMicrotask(() => child.emit("exit", 1))
      return child as unknown as ReturnType<typeof spawn>
    })

    await expect(
      withCanvasSession({ ...options, skipBuild: true }, vi.fn())
    ).rejects.toThrow("preview server exited")

    expect(spawnSync).not.toHaveBeenCalled()
    expect(spawn).toHaveBeenCalledWith(
      process.execPath,
      [entry, "start", "-p", "4567"],
      {
        cwd: "C:\\My decks\\demo",
        env: { ...process.env, NODE_ENV: "production" },
        stdio: "inherit",
      }
    )
  })

  it("explains missing Next dependencies before spawning a build", async () => {
    vi.mocked(resolveFromProject).mockReturnValue(null)

    await expect(withCanvasSession(options, vi.fn())).rejects.toThrow(
      "Next.js does not resolve from this deck"
    )
    expect(spawnSync).not.toHaveBeenCalled()
  })
})
