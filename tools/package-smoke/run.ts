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

// Classes only the runtime writes. Tailwind can only reach them through the
// @source the package stylesheet registers against its own compiled output.
const runtimeUtilities = ["min-h-16", "backdrop-blur-sm", "data-slide-chrome"]

// The fixture deck imports one built-in theme and nothing else. Its stylesheet
// has to reach the build with no wiring, and the other five have to stay out of
// it, because the barrel re-exports all six from one module.
const importedTheme = ".phosphor-theme"
const unimportedThemes = [
  ".broadsheet-theme",
  ".deckard-theme",
  ".ledger-theme",
  ".meridian-theme",
  ".nexus-theme",
]

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

// The fixture is the app a consumer writes, so anything the package should be
// doing for them cannot appear in it.
function assertPlainConsumer() {
  const config = fs.readFileSync(
    path.join(fixtureSource, "next.config.ts"),
    "utf8"
  )

  if (config.includes("transpilePackages")) {
    throw new Error("The fixture must build without transpilePackages")
  }

  const css = fs.readFileSync(
    path.join(fixtureSource, "app/globals.css"),
    "utf8"
  )

  if (css.includes("@source")) {
    throw new Error("The fixture must build without a consumer-level @source")
  }
}

function builtCss(directory: string) {
  const staticDirectory = path.join(directory, ".next/static")

  return fs
    .readdirSync(staticDirectory, { recursive: true })
    .map((entry) => path.join(staticDirectory, String(entry)))
    .filter((entry) => entry.endsWith(".css"))
    .map((entry) => fs.readFileSync(entry, "utf8"))
    .join("\n")
}

function assertRuntimeStyles(css: string) {
  const missing = runtimeUtilities.filter((utility) => !css.includes(utility))

  if (missing.length > 0) {
    throw new Error(
      `The built CSS is missing runtime utilities: ${missing.join(", ")}`
    )
  }
}

function assertBuiltInTheme(css: string) {
  if (!css.includes(importedTheme)) {
    throw new Error(
      `The built CSS is missing ${importedTheme}, so importing a theme from @deckard/themes did not carry its stylesheet`
    )
  }

  const leaked = unimportedThemes.filter((selector) => css.includes(selector))

  if (leaked.length > 0) {
    throw new Error(
      `The built CSS carries themes the deck never imported: ${leaked.join(", ")}`
    )
  }
}

function pack(filter: string, destination: string, name: string) {
  const before = new Set(fs.readdirSync(destination))
  const result = spawnSync(
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
    { cwd: repoRoot, encoding: "utf8", stdio: ["inherit", "pipe", "inherit"] }
  )

  if (result.status !== 0) {
    throw new Error(`pnpm pack failed for ${filter}`)
  }

  const packed = fs
    .readdirSync(destination)
    .find((entry) => entry.endsWith(".tgz") && !before.has(entry))

  if (!packed) {
    throw new Error(`pnpm pack produced no tarball for ${filter}`)
  }

  fs.renameSync(
    path.join(destination, packed),
    path.join(destination, `${name}.tgz`)
  )
}

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "deckard-smoke-"))
const appDirectory = path.join(scratch, "app")

try {
  assertPlainConsumer()
  run(
    "pnpm",
    [
      "--filter",
      "@deckard/core",
      "--filter",
      "@deckard/themes",
      "run",
      "build",
    ],
    repoRoot
  )
  pack("@deckard/core", scratch, "deckard-core")
  pack("@deckard/themes", scratch, "deckard-themes")
  fs.cpSync(fixtureSource, appDirectory, { recursive: true })

  run(
    "pnpm",
    ["install", "--prefer-offline", "--ignore-workspace"],
    appDirectory
  )
  run("pnpm", ["run", "typecheck"], appDirectory)
  run("pnpm", ["run", "build"], appDirectory)

  const css = builtCss(appDirectory)

  assertRuntimeStyles(css)
  assertBuiltInTheme(css)

  process.stdout.write(
    "\n@deckard/core and @deckard/themes build and style a standalone Next.js app\n"
  )
} finally {
  if (keepScratch) {
    process.stdout.write(`scratch kept at ${scratch}\n`)
  } else {
    fs.rmSync(scratch, { force: true, recursive: true })
  }
}
