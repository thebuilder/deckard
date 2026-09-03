#!/usr/bin/env node
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

import { themeIds } from "../../packages/themes/src/ids.ts"

const toolDirectory = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(toolDirectory, "../..")
const tarballDirectory = path.join(repoRoot, "dist-tarballs")

interface Package {
  // Every path an installer has to find inside the tarball, plus the README
  // and LICENSE the npm page shows. npm prefixes the archive with package/,
  // which is added below rather than written out here.
  contents: string[]
  filter: string
  name: string
  // Everything a stale build could leave behind. tsc skips emitting when its
  // build info says the output is current, so the build info goes with the
  // output it describes.
  stale: string[]
}

const packages: Package[] = [
  {
    contents: [
      "dist/index.js",
      "dist/index.d.ts",
      "dist/components/index.js",
      "dist/next/routes.js",
      "dist/deck/discovery.js",
      "dist/ui/index.js",
      "styles.css",
      "README.md",
      "LICENSE",
    ],
    filter: "@deckard/core",
    name: "deckard-core",
    stale: ["packages/core/dist", "packages/core/tsconfig.build.tsbuildinfo"],
  },
  {
    contents: [
      "dist/index.js",
      "dist/index.d.ts",
      ...themeIds.flatMap((theme) => [
        `dist/${theme}/index.js`,
        `dist/${theme}/theme.css`,
        `dist/${theme}/THEME.md`,
      ]),
      "README.md",
      "LICENSE",
    ],
    filter: "@deckard/themes",
    name: "deckard-themes",
    stale: [
      "packages/themes/dist",
      "packages/themes/tsconfig.build.tsbuildinfo",
    ],
  },
  {
    contents: [
      "bin/deckard.mjs",
      "dist/index.js",
      "dist/commands/init.js",
      "template/deck/deck.ts",
      "template/app/slides/[id]/page.tsx",
      "template/app/slides/blocks/templates.tsx",
      "template/versions.json",
      "README.md",
      "LICENSE",
    ],
    filter: "@deckard/cli",
    name: "deckard-cli",
    stale: [
      "packages/cli/dist",
      "packages/cli/template",
      "packages/cli/tsconfig.build.tsbuildinfo",
    ],
  },
]

const timings: [string, number][] = []

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: "inherit",
  })

  assert(result.status === 0, `${command} ${args.join(" ")} failed`)
}

function time<T>(label: string, work: () => T): T {
  const startedAt = Date.now()
  const value = work()

  timings.push([label, Date.now() - startedAt])

  return value
}

function clean() {
  for (const stale of packages.flatMap((entry) => entry.stale)) {
    fs.rmSync(path.join(repoRoot, stale), { force: true, recursive: true })
  }

  fs.rmSync(tarballDirectory, { force: true, recursive: true })
  fs.mkdirSync(tarballDirectory, { recursive: true })
}

// --force, because a release is the one run that may not take a cached answer
// for what the tarballs contain. turbo still orders the three by ^build.
function build() {
  run("pnpm", [
    "exec",
    "turbo",
    "run",
    "build",
    "--force",
    ...packages.flatMap((entry) => ["--filter", entry.filter]),
  ])
}

function pack({ filter, name }: Package): string {
  const before = new Set(fs.readdirSync(tarballDirectory))

  run("pnpm", [
    "--filter",
    filter,
    "exec",
    "pnpm",
    "pack",
    "--pack-destination",
    tarballDirectory,
  ])

  const packed = fs
    .readdirSync(tarballDirectory)
    .find((entry) => entry.endsWith(".tgz") && !before.has(entry))

  assert(packed, `pnpm pack produced no tarball for ${filter}`)

  const tarball = path.join(tarballDirectory, `${name}.tgz`)

  fs.renameSync(path.join(tarballDirectory, packed), tarball)

  return tarball
}

function entries(tarball: string): string[] {
  const listed = spawnSync("tar", ["-tzf", tarball], { encoding: "utf8" })

  assert(listed.status === 0, `tar could not read ${tarball}`)

  return listed.stdout.split("\n").map((entry) => entry.trim())
}

function inspect(entry: Package, tarball: string) {
  const listed = new Set(entries(tarball))
  const missing = entry.contents.filter(
    (file) => !listed.has(`package/${file}`)
  )

  assert(
    missing.length === 0,
    `${path.basename(tarball)} is missing ${missing.join(", ")}. An installer would find a broken package.`
  )

  const { size } = fs.statSync(tarball)

  process.stdout.write(
    `  ${entry.filter.padEnd(16)} ${listed.size - 1} files, ${(size / 1024).toFixed(0)}kB\n`
  )
}

clean()
time("build the three packages from nothing", build)

const tarballs = time("pack the three tarballs", () =>
  packages.map((entry) => pack(entry))
)

process.stdout.write("\nthe tarballs carry what an installer needs\n")

for (const [index, entry] of packages.entries()) {
  inspect(entry, tarballs[index])
}

process.stdout.write("\n")

time("scaffold a deck from these exact tarballs", () => {
  run("node", [
    path.join(repoRoot, "tools/cli-smoke/run.ts"),
    "--core-tarball",
    tarballs[0],
    "--themes-tarball",
    tarballs[1],
    "--cli-tarball",
    tarballs[2],
  ])
})

const width = Math.max(...timings.map(([label]) => label.length))

process.stdout.write(`\nrelease:pack wrote ${tarballDirectory}\n`)

for (const [label, elapsed] of timings) {
  process.stdout.write(
    `  ${label.padEnd(width)}  ${(elapsed / 1000).toFixed(1)}s\n`
  )
}
