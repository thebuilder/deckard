#!/usr/bin/env node
import { spawn } from "node:child_process"
import fs from "node:fs"
import http from "node:http"
import os from "node:os"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const toolDirectory = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(toolDirectory, "../..")
const fixtureSource = path.join(toolDirectory, "fixture")
const keepScratch = process.argv.includes("--keep")
const ownershipMark = "mt-[13px]"
const ownershipRule = "13px"

const blockFiles = [
  "typography.tsx",
  "templates.tsx",
  "collections.tsx",
  "media.tsx",
]

// The fixture deck imports this one from @thebuilder/deckard-themes. Nothing installs
// it, so finding its class in the build proves the import is the whole path.
const themeSelector = ".ledger-theme"

// Classes only the @thebuilder/deckard-core runtime writes. Tailwind reaches them through
// the @source the package stylesheet registers against its own compiled output,
// so finding them proves the single @import is the whole contract.
const runtimeUtilities = ["min-h-16", "backdrop-blur-sm", "data-slide-chrome"]

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

function run(command: string, args: string[], cwd: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      stdio: ["inherit", "inherit", "inherit"],
    })

    child.on("error", reject)
    child.on("close", (status) => {
      if (status === 0) {
        resolve()
        return
      }

      reject(new Error(`${command} ${args.join(" ")} failed in ${cwd}`))
    })
  })
}

async function pack(filter: string, destination: string, name: string) {
  const before = new Set(fs.readdirSync(destination))

  await run(
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

  fs.renameSync(
    path.join(destination, packed),
    path.join(destination, `${name}.tgz`)
  )
}

function serveRegistry(directory: string) {
  const server = http.createServer((request, response) => {
    const name = path.basename(new URL(request.url ?? "/", "http://x").pathname)
    const file = path.join(directory, name)

    if (!(name.endsWith(".json") && fs.existsSync(file))) {
      response.writeHead(404).end()
      return
    }

    response.writeHead(200, { "content-type": "application/json" })
    response.end(fs.readFileSync(file))
  })

  return new Promise<{ close: () => void; port: number }>((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address()
      assert(
        address && typeof address === "object",
        "registry server has no port"
      )
      resolve({ close: () => server.close(), port: address.port })
    })
  })
}

function pointAtRegistry(appDirectory: string, port: number) {
  const file = path.join(appDirectory, "components.json")
  const config = JSON.parse(fs.readFileSync(file, "utf8"))

  config.registries = {
    "@deckard": `http://127.0.0.1:${port}/{name}.json`,
  }

  fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`)
}

function readFile(appDirectory: string, relative: string) {
  return fs.readFileSync(path.join(appDirectory, relative), "utf8")
}

function assertConsumerOwned(appDirectory: string) {
  for (const block of blockFiles) {
    const name = path.join("app/slides/blocks", block)
    const file = path.join(appDirectory, name)
    const stats = fs.lstatSync(file)

    assert(stats.isFile(), `${name} is not a regular file in the consumer app`)
    assert(stats.size > 0, `${name} installed empty`)
    fs.accessSync(file, fs.constants.W_OK)
  }

  assert(
    !fs.existsSync(path.join(appDirectory, "deck/theme")),
    "the registry installed a deck/theme, which is no longer its job"
  )

  fs.appendFileSync(
    path.join(appDirectory, "app/slides/blocks/typography.tsx"),
    `\nexport const ownershipToken = "${ownershipMark}"\n`
  )
}

function assertStylesheetWiring(appDirectory: string) {
  const css = readFile(appDirectory, "app/globals.css")

  assert(
    css.includes('@import "@thebuilder/deckard-core/styles.css"'),
    "the preset did not add the @thebuilder/deckard-core stylesheet import"
  )
  assert(
    !css.includes("@source"),
    "the preset wrote a consumer @source, which the package now registers itself"
  )
}

function assertPlainNextConfig(appDirectory: string) {
  const config = readFile(appDirectory, "next.config.ts")

  assert(
    !config.includes("transpilePackages"),
    "the consumer app needs no transpilePackages, because @thebuilder/deckard-core ships compiled"
  )
}

function findStylesheets(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      return findStylesheets(file)
    }

    return entry.name.endsWith(".css") ? [file] : []
  })
}

function assertBuiltStylesheet(appDirectory: string) {
  const bundles = findStylesheets(path.join(appDirectory, ".next"))

  assert(bundles.length > 0, "next build emitted no stylesheet")

  const css = bundles.map((file) => fs.readFileSync(file, "utf8")).join("\n")

  assert(
    css.includes(ownershipRule),
    "the edit to the installed block never reached the built stylesheet"
  )

  assert(
    css.includes(themeSelector),
    `the built stylesheet has no ${themeSelector}, so the built-in theme the deck imports never reached it`
  )

  const missing = runtimeUtilities.filter((utility) => !css.includes(utility))

  assert(
    missing.length === 0,
    `the built stylesheet is missing @thebuilder/deckard-core runtime utilities: ${missing.join(", ")}`
  )
}

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "deckard-registry-"))
const smokeApp = path.join(scratch, "app")
const registryDirectory = path.join(scratch, "r")
const server = await serveRegistry(registryDirectory)

try {
  await run("shadcn", ["build", "--output", registryDirectory], repoRoot)
  await run(
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
  await pack("@thebuilder/deckard-core", scratch, "thebuilder-deckard-core")
  await pack("@thebuilder/deckard-themes", scratch, "thebuilder-deckard-themes")
  fs.cpSync(fixtureSource, smokeApp, { recursive: true })
  pointAtRegistry(smokeApp, server.port)

  await run(
    "pnpm",
    ["install", "--prefer-offline", "--ignore-workspace"],
    smokeApp
  )
  await run(
    "pnpm",
    ["dlx", "shadcn@latest", "add", "@deckard/preset-blocks", "-y"],
    smokeApp
  )

  assertConsumerOwned(smokeApp)
  assertStylesheetWiring(smokeApp)
  assertPlainNextConfig(smokeApp)

  await run("pnpm", ["run", "typecheck"], smokeApp)
  await run("pnpm", ["run", "build"], smokeApp)
  assertBuiltStylesheet(smokeApp)

  process.stdout.write(
    "\nthe Deckard registry installs and builds in a clean Next.js app\n"
  )
} finally {
  server.close()

  if (keepScratch) {
    process.stdout.write(`scratch kept at ${scratch}\n`)
  } else {
    fs.rmSync(scratch, { force: true, recursive: true })
  }
}
