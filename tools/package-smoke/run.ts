#!/usr/bin/env node
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

import { themeIds } from "../../packages/themes/src/ids.ts"

const toolDirectory = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(toolDirectory, "../..")
const fixtureSource = path.join(toolDirectory, "fixture")
const keepScratch = process.argv.includes("--keep")

// Classes only the runtime writes. Tailwind can only reach them through the
// @source the package stylesheet registers against its own compiled output.
const runtimeUtilities = ["min-h-16", "backdrop-blur-sm", "data-slide-chrome"]

// A face is named <family>[-<weight>][-italic]-<subset>.woff2 and its licence is
// <family>.OFL.txt.
const faceVariant = /-(?:italic|\d{3})$/

// The fixture deck imports one built-in theme. Its stylesheet has to reach the
// build with no wiring, and every other one has to stay out of it, because the
// barrel re-exports them all from one module.
const importedThemeId = "phosphor"
const importedTheme = `.${importedThemeId}-theme`

// phosphor self-hosts JetBrains Mono, so the fixture is also the proof that a
// theme carries its typeface with no wiring in the consuming app. The woff2 has
// to be inside the tarball, emitted into the build, and reached by an @font-face
// rule; the faces of every other family have to stay out of the build.
const importedFace = "jetbrains-mono-latin"
const unimportedFaces = [
  "ibm-plex-mono",
  "ibm-plex-sans",
  "orbitron",
  "public-sans",
  "schibsted-grotesk",
  "source-serif-4",
]
// Read off the shipped ids, so a theme added to the package is checked for
// here without an edit.
const unimportedThemes = themeIds
  .filter((id) => id !== importedThemeId)
  .map((id) => `.${id}-theme`)

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
      `The built CSS is missing ${importedTheme}, so importing a theme from @thebuilder/deckard-themes did not carry its stylesheet`
    )
  }

  const leaked = unimportedThemes.filter((selector) => css.includes(selector))

  if (leaked.length > 0) {
    throw new Error(
      `The built CSS carries themes the deck never imported: ${leaked.join(", ")}`
    )
  }
}

// The licence has to be in the tarball beside the binaries it covers.
function assertPackedFonts(tarball: string) {
  const result = spawnSync("tar", ["-tzf", tarball], { encoding: "utf8" })

  if (result.status !== 0) {
    throw new Error(`Could not list ${tarball}`)
  }

  const entries = result.stdout.split("\n")
  const fonts = entries.filter((entry) => entry.endsWith(".woff2"))

  if (fonts.length === 0) {
    throw new Error(
      "The @thebuilder/deckard-themes tarball ships no woff2 files, so a theme that self-hosts a typeface would render in its fallback stack"
    )
  }

  const unlicensed = fonts.filter(
    (font) =>
      !entries.includes(
        `${path.dirname(font)}/${path.basename(font).slice(0, path.basename(font).indexOf("-latin")).replace(faceVariant, "")}.OFL.txt`
      )
  )

  if (unlicensed.length > 0) {
    throw new Error(
      `The tarball ships fonts with no licence beside them: ${unlicensed.join(", ")}`
    )
  }
}

function assertBuiltFonts(directory: string, css: string) {
  const emitted = fs
    .readdirSync(path.join(directory, ".next/static"), { recursive: true })
    .map((entry) => path.basename(String(entry)))
    .filter((entry) => entry.endsWith(".woff2"))

  if (!emitted.some((font) => font.startsWith(importedFace))) {
    throw new Error(
      `The build emitted no ${importedFace} woff2, so the theme stylesheet did not carry its typeface out of node_modules`
    )
  }

  if (!css.includes("@font-face")) {
    throw new Error("The built CSS declares no @font-face for the theme")
  }

  const leaked = unimportedFaces.filter((face) =>
    emitted.some((font) => font.startsWith(face))
  )

  if (leaked.length > 0) {
    throw new Error(
      `The build emitted fonts no theme in this deck asks for: ${leaked.join(", ")}`
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
      "@thebuilder/deckard-core",
      "--filter",
      "@thebuilder/deckard-themes",
      "run",
      "build",
    ],
    repoRoot
  )
  pack("@thebuilder/deckard-core", scratch, "deckard-core")
  pack("@thebuilder/deckard-themes", scratch, "deckard-themes")
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
  assertPackedFonts(path.join(scratch, "deckard-themes.tgz"))
  assertBuiltFonts(appDirectory, css)

  process.stdout.write(
    "\n@thebuilder/deckard-core and @thebuilder/deckard-themes build and style a standalone Next.js app\n"
  )
} finally {
  if (keepScratch) {
    process.stdout.write(`scratch kept at ${scratch}\n`)
  } else {
    fs.rmSync(scratch, { force: true, recursive: true })
  }
}
