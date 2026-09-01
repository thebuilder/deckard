#!/usr/bin/env node
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const toolDirectory = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(toolDirectory, "../..")
const keepScratch = process.argv.includes("--keep")
const cliEntry = path.join(repoRoot, "packages/cli/bin/deckard.mjs")

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

function run(command: string, args: string[], cwd: string) {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: "inherit",
  })

  assert(result.status === 0, `${command} ${args.join(" ")} failed in ${cwd}`)
}

function pack(filter: string, destination: string, name: string) {
  const before = new Set(fs.readdirSync(destination))

  run(
    "pnpm",
    [
      "--filter",
      filter,
      "exec",
      "pnpm",
      "pack",
      "--pack-destination",
      destination,
    ],
    repoRoot
  )

  const packed = fs
    .readdirSync(destination)
    .find((entry) => entry.endsWith(".tgz") && !before.has(entry))

  assert(packed, `pnpm pack produced no tarball for ${filter}`)

  const tarball = path.join(destination, `${name}.tgz`)

  fs.renameSync(path.join(destination, packed), tarball)

  return tarball
}

// The deck it generates has to prerender: every slide route is static HTML on
// disk, which is what the framework promises and what the PDF export needs.
function assertStaticSlides(directory: string, ids: string[]) {
  const routes = path.join(directory, ".next/server/app/slides")
  const missing = ids.filter(
    (id) => !fs.existsSync(path.join(routes, `${id}.html`))
  )

  assert(
    missing.length === 0,
    `next build did not prerender ${missing.join(", ")} to ${routes}`
  )
}

function assertScreenshot(directory: string) {
  const manifestPath = path.join(directory, "out/screenshots/manifest.json")

  assert(fs.existsSync(manifestPath), "deckard screenshots wrote no manifest")

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
    slides: { file: string }[]
  }

  assert(manifest.slides.length === 1, "--max 1 captured more than one slide")

  const png = path.join(directory, "out/screenshots", manifest.slides[0].file)

  assert(fs.existsSync(png), `the manifest names ${png}, which is not a file`)
  assert(fs.statSync(png).size > 0, `${png} is empty`)
}

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "deckard-cli-"))
const appDirectory = path.join(scratch, "my-talk")
const deckard = path.join(appDirectory, "node_modules/.bin/deckard")

try {
  // Through the root script, so turbo builds @deckard/core first. A direct
  // filtered run leaves the cli compiling against types that do not exist yet.
  run("pnpm", ["cli:build"], repoRoot)

  const core = pack("@deckard/core", scratch, "deckard-core")
  const cli = pack("@deckard/cli", scratch, "deckard-cli")
  const startedAt = Date.now()

  run(
    "node",
    [
      cliEntry,
      "init",
      "my-talk",
      "--core-tarball",
      core,
      "--cli-tarball",
      cli,
      "--no-git",
      "--package-manager",
      "pnpm",
    ],
    scratch
  )

  const initSeconds = ((Date.now() - startedAt) / 1000).toFixed(1)

  assert(
    fs.existsSync(deckard),
    "the generated app has no deckard binary, so the init did not install"
  )

  run("pnpm", ["run", "typecheck"], appDirectory)
  run("pnpm", ["run", "build"], appDirectory)
  assertStaticSlides(appDirectory, ["intro", "keyboard", "2"])

  run(deckard, ["validate"], appDirectory)
  run(deckard, ["doctor"], appDirectory)
  run(
    deckard,
    ["screenshots", "--max", "1", "--skip-build", "--port", "3414"],
    appDirectory
  )
  assertScreenshot(appDirectory)

  process.stdout.write(
    `\ndeckard init builds a working deck outside the workspace, in ${initSeconds}s including install\n`
  )
} finally {
  if (keepScratch) {
    process.stdout.write(`scratch kept at ${scratch}\n`)
  } else {
    fs.rmSync(scratch, { force: true, recursive: true })
  }
}
