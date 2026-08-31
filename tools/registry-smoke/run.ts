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
const ownershipToken = "--slide-registry-smoke"

const themeFiles = ["theme.css", "index.ts", "THEME.md"]
const blockFiles = [
  "typography.tsx",
  "templates.tsx",
  "collections.tsx",
  "media.tsx",
]

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

async function packCore(destination: string) {
  await run(
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
    repoRoot
  )

  const packed = fs
    .readdirSync(destination)
    .find((entry) => entry.endsWith(".tgz"))

  assert(packed, "pnpm pack produced no tarball")

  fs.renameSync(
    path.join(destination, packed),
    path.join(destination, "deckard-core.tgz")
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
  for (const name of [
    ...themeFiles.map((file) => path.join("deck/theme", file)),
    ...blockFiles.map((file) => path.join("app/slides/blocks", file)),
  ]) {
    const file = path.join(appDirectory, name)
    const stats = fs.lstatSync(file)

    assert(stats.isFile(), `${name} is not a regular file in the consumer app`)
    assert(stats.size > 0, `${name} installed empty`)
    fs.accessSync(file, fs.constants.W_OK)
  }

  const themeCss = path.join(appDirectory, "deck/theme/theme.css")
  fs.appendFileSync(
    themeCss,
    `\n.deckard-theme {\n  ${ownershipToken}: 1;\n}\n`
  )
}

function assertStylesheetWiring(appDirectory: string) {
  const css = readFile(appDirectory, "app/globals.css")

  assert(
    css.includes('@import "@deckard/core/styles.css"'),
    "the preset did not add the @deckard/core stylesheet import"
  )
  assert(
    css.includes("@source") && css.includes("@deckard/core/src"),
    "the preset did not add the Tailwind @source line"
  )
}

function applyTranspilePackages(appDirectory: string) {
  const file = path.join(appDirectory, "next.config.mjs")
  const config = fs.readFileSync(file, "utf8")

  assert(
    !config.includes("transpilePackages"),
    "the fixture already transpiled the package, so this step proves nothing"
  )

  fs.writeFileSync(
    file,
    config.replace(
      "const nextConfig = {}",
      'const nextConfig = {\n  transpilePackages: ["@deckard/core"],\n}'
    )
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

function assertThemeReachedTheBuild(appDirectory: string) {
  const bundles = findStylesheets(path.join(appDirectory, ".next"))

  assert(bundles.length > 0, "next build emitted no stylesheet")

  const found = bundles.some((file) =>
    fs.readFileSync(file, "utf8").includes(ownershipToken)
  )

  assert(
    found,
    "the edit to deck/theme/theme.css never reached the built stylesheet"
  )
}

function assertBroadsheetReplacedTheTheme(appDirectory: string) {
  const index = readFile(appDirectory, "deck/theme/index.ts")
  const css = readFile(appDirectory, "deck/theme/theme.css")

  assert(
    index.includes('className: "broadsheet-theme"'),
    "theme-broadsheet did not replace deck/theme/index.ts"
  )
  assert(
    css.includes(".broadsheet-theme") && !css.includes(ownershipToken),
    "theme-broadsheet did not replace deck/theme/theme.css"
  )
}

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "deckard-registry-"))
const smokeApp = path.join(scratch, "app")
const registryDirectory = path.join(scratch, "r")
const server = await serveRegistry(registryDirectory)

try {
  await run("shadcn", ["build", "--output", registryDirectory], repoRoot)
  await packCore(scratch)
  fs.cpSync(fixtureSource, smokeApp, { recursive: true })
  pointAtRegistry(smokeApp, server.port)

  await run(
    "pnpm",
    ["install", "--prefer-offline", "--ignore-workspace"],
    smokeApp
  )
  await run(
    "pnpm",
    ["dlx", "shadcn@latest", "add", "@deckard/preset-deckard", "-y"],
    smokeApp
  )

  assertConsumerOwned(smokeApp)
  assertStylesheetWiring(smokeApp)
  applyTranspilePackages(smokeApp)

  await run("pnpm", ["run", "typecheck"], smokeApp)
  await run("pnpm", ["run", "build"], smokeApp)
  assertThemeReachedTheBuild(smokeApp)

  await run(
    "pnpm",
    ["dlx", "shadcn@latest", "add", "@deckard/theme-broadsheet", "-y", "-o"],
    smokeApp
  )
  assertBroadsheetReplacedTheTheme(smokeApp)
  await run("pnpm", ["run", "typecheck"], smokeApp)

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
