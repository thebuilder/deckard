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

const timings: [string, number][] = []
const managerPattern = /\b(pnpm|yarn|bun)\b/

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

// npm_config_* leaks from whatever ran this script. The point of the two passes
// below is that each manager announces itself, so the parent's announcement has
// to go.
function childEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env }

  for (const key of Object.keys(env)) {
    if (key.startsWith("npm_config_") || key.startsWith("npm_package_")) {
      delete env[key]
    }
  }

  env.NEXT_TELEMETRY_DISABLED = "1"

  return env
}

function run(command: string, args: string[], cwd: string) {
  const result = spawnSync(command, args, {
    cwd,
    env: childEnv(),
    stdio: "inherit",
  })

  assert(result.status === 0, `${command} ${args.join(" ")} failed in ${cwd}`)
}

function time<T>(label: string, work: () => T): T {
  const startedAt = Date.now()
  const value = work()

  timings.push([label, Date.now() - startedAt])

  return value
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

// The published tarball has to be able to scaffold on its own: its template has
// to resolve from inside the installed package, not from a repository checkout
// next to it. So the CLI is installed outside the workspace and init is run
// through that copy, never through packages/cli/bin.
function installCli(manager: string, directory: string, tarball: string) {
  fs.mkdirSync(directory, { recursive: true })
  fs.writeFileSync(
    path.join(directory, "package.json"),
    `${JSON.stringify(
      {
        dependencies: { "@deckard/cli": `file:${tarball}` },
        name: `deckard-cli-smoke-${manager}`,
        private: true,
        version: "0.0.0",
      },
      null,
      2
    )}\n`
  )

  time(`${manager}: install the packed CLI`, () => {
    run(manager, ["install"], directory)
  })

  const binary = path.join(directory, "node_modules/.bin/deckard")

  assert(
    fs.existsSync(binary),
    `${manager} install left no deckard binary in ${directory}`
  )

  return binary
}

// Ejecting turns the imported preset into three files the deck owns, and the
// deck has to keep typechecking against the copy.
function assertEjected(directory: string) {
  for (const file of ["theme.css", "index.ts", "THEME.md"]) {
    const target = path.join(directory, "deck/theme", file)

    assert(fs.existsSync(target), `deckard eject theme did not write ${file}`)
    assert(fs.statSync(target).size > 0, `deck/theme/${file} ejected empty`)
  }

  const source = fs.readFileSync(path.join(directory, "deck/deck.ts"), "utf8")

  assert(
    source.includes('import { theme } from "@/deck/theme"') &&
      !source.includes("@deckard/themes"),
    "deckard eject theme left deck.ts pointing at the built-in"
  )

  assert(
    fs
      .readFileSync(path.join(directory, "deck/theme/index.ts"), "utf8")
      .includes('id: "deckard"'),
    "the ejected deck/theme/index.ts does not carry the theme it was ejected from"
  )
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

// The template files can only have come from inside the installed package, and
// the manager that ran init is the one the deck records for every later command.
function assertScaffold(manager: string, directory: string) {
  for (const file of [
    "app/globals.css",
    "app/slides/[id]/page.tsx",
    "deck/deck.ts",
    "deck/slides/10-keyboard.slide.tsx",
  ]) {
    assert(
      fs.existsSync(path.join(directory, file)),
      `the packed CLI did not write ${file}, so its template did not resolve`
    )
  }

  assert(
    !fs.existsSync(path.join(directory, "deck/theme")),
    "init copied theme files, which the built-in themes replaced"
  )

  assert(
    fs
      .readFileSync(path.join(directory, "deck/deck.ts"), "utf8")
      .includes('import { deckard } from "@deckard/themes"'),
    "the generated deck.ts does not import its theme from @deckard/themes"
  )

  const generated = JSON.parse(
    fs.readFileSync(path.join(directory, "package.json"), "utf8")
  ) as {
    dependencies: Record<string, string>
    packageManager?: string
    scripts: Record<string, string>
  }

  assert(
    "@deckard/themes" in generated.dependencies,
    "the generated package.json does not depend on @deckard/themes"
  )

  assert(
    generated.packageManager?.startsWith(`${manager}@`),
    `the deck records "${generated.packageManager}" after an init run through ${manager}`
  )

  const assuming = Object.entries(generated.scripts).filter(([, line]) =>
    managerPattern.test(line)
  )

  assert(
    assuming.length === 0,
    `the generated scripts name a package manager: ${assuming.map(([name]) => name).join(", ")}`
  )
}

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "deckard-cli-"))

try {
  time("build @deckard/core, @deckard/themes, and @deckard/cli", () => {
    run("pnpm", ["cli:build"], repoRoot)
  })

  const core = pack("@deckard/core", scratch, "deckard-core")
  const themes = pack("@deckard/themes", scratch, "deckard-themes")
  const cli = pack("@deckard/cli", scratch, "deckard-cli")

  const initFlags = [
    "--core-tarball",
    core,
    "--themes-tarball",
    themes,
    "--cli-tarball",
    cli,
    "--no-git",
  ]

  const pnpmInstaller = path.join(scratch, "via-pnpm")
  const pnpmApp = path.join(scratch, "my-talk")

  installCli("pnpm", pnpmInstaller, cli)

  time("pnpm: deckard init, install included", () => {
    run(
      "pnpm",
      ["exec", "deckard", "init", pnpmApp, ...initFlags],
      pnpmInstaller
    )
  })

  assertScaffold("pnpm", pnpmApp)

  const deckard = path.join(pnpmApp, "node_modules/.bin/deckard")

  assert(
    fs.existsSync(deckard),
    "the generated app has no deckard binary, so the init did not install"
  )

  time("pnpm: typecheck", () => {
    run("pnpm", ["run", "typecheck"], pnpmApp)
  })
  time("pnpm: next build", () => {
    run("pnpm", ["run", "build"], pnpmApp)
  })
  assertStaticSlides(pnpmApp, ["intro", "keyboard", "2"])

  time("pnpm: validate, doctor, one screenshot", () => {
    run(deckard, ["validate"], pnpmApp)
    run(deckard, ["doctor"], pnpmApp)
    run(
      deckard,
      ["screenshots", "--max", "1", "--skip-build", "--port", "3414"],
      pnpmApp
    )
  })
  assertScreenshot(pnpmApp)

  time("pnpm: eject the theme, then validate and typecheck the copy", () => {
    run(deckard, ["eject", "theme"], pnpmApp)
    assertEjected(pnpmApp)
    run(deckard, ["validate"], pnpmApp)
    run("pnpm", ["run", "typecheck"], pnpmApp)
  })

  // The headline flow is npx on a machine that has never seen pnpm. It gets the
  // shorter pass: install, typecheck, build, and no browser.
  const npmInstaller = path.join(scratch, "via-npm")
  const npmApp = path.join(scratch, "my-npm-talk")

  installCli("npm", npmInstaller, cli)

  time("npm: deckard init, install included", () => {
    run(
      "npm",
      ["exec", "--", "deckard", "init", npmApp, ...initFlags],
      npmInstaller
    )
  })

  assertScaffold("npm", npmApp)
  assert(
    fs.existsSync(path.join(npmApp, "package-lock.json")),
    "the npm init did not install with npm"
  )

  time("npm: typecheck", () => {
    run("npm", ["run", "typecheck"], npmApp)
  })
  time("npm: next build", () => {
    run("npm", ["run", "build"], npmApp)
  })
  assertStaticSlides(npmApp, ["intro", "keyboard", "2"])

  const width = Math.max(...timings.map(([label]) => label.length))

  process.stdout.write("\nthe packed deckard scaffolds a working deck twice\n")

  for (const [label, elapsed] of timings) {
    process.stdout.write(
      `  ${label.padEnd(width)}  ${(elapsed / 1000).toFixed(1)}s\n`
    )
  }

  process.stdout.write(
    `  ${"total".padEnd(width)}  ${(timings.reduce((sum, [, elapsed]) => sum + elapsed, 0) / 1000).toFixed(1)}s\n`
  )
} finally {
  if (keepScratch) {
    process.stdout.write(`scratch kept at ${scratch}\n`)
  } else {
    fs.rmSync(scratch, { force: true, recursive: true })
  }
}
