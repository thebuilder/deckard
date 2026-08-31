#!/usr/bin/env node
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const toolDirectory = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(toolDirectory, "../..")
const fixtureSource = path.join(toolDirectory, "fixture")
const keepScratch = process.argv.includes("--keep")

function run(command: string, args: string[], cwd: string) {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: "inherit",
  })

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed in ${cwd}`)
  }
}

function packCore(destination: string) {
  const result = spawnSync(
    "pnpm",
    [
      "--filter",
      "@deckard/core",
      "exec",
      "pnpm",
      "pack",
      "--pack-destination",
      destination,
    ],
    { cwd: repoRoot, encoding: "utf8", stdio: ["inherit", "pipe", "inherit"] }
  )

  if (result.status !== 0) {
    throw new Error("pnpm pack failed")
  }

  const packed = fs
    .readdirSync(destination)
    .find((entry) => entry.endsWith(".tgz"))

  if (!packed) {
    throw new Error("pnpm pack produced no tarball")
  }

  fs.renameSync(
    path.join(destination, packed),
    path.join(destination, "deckard-core.tgz")
  )
}

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "deckard-smoke-"))
const appDirectory = path.join(scratch, "app")

try {
  packCore(scratch)
  fs.cpSync(fixtureSource, appDirectory, { recursive: true })

  run(
    "pnpm",
    ["install", "--prefer-offline", "--ignore-workspace"],
    appDirectory
  )
  run("pnpm", ["run", "typecheck"], appDirectory)
  run("pnpm", ["run", "build"], appDirectory)

  process.stdout.write("\n@deckard/core builds in a standalone Next.js app\n")
} finally {
  if (keepScratch) {
    process.stdout.write(`scratch kept at ${scratch}\n`)
  } else {
    fs.rmSync(scratch, { force: true, recursive: true })
  }
}
