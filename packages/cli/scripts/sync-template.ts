#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const repoRoot = path.resolve(packageRoot, "../..")
const templateRoot = path.join(packageRoot, "template")
const checkOnly = process.argv.includes("--check")

const blocks = [
  "collections.tsx",
  "media.tsx",
  "metrics.tsx",
  "templates.tsx",
  "typography.tsx",
]
// The pins a generated deck writes into "packageManager" when the manager that
// invoked it does not announce its own version. pnpm's comes from this
// repository so the two never drift; the other three are the current stable
// releases, read from the npm registry on 2026-09-01.
const packageManagerPins = {
  bun: "1.4.0",
  npm: "12.0.2",
  yarn: "4.18.0",
}

// The versions a generated deck installs are the versions the reference deck
// runs, so a Next or Tailwind bump reaches new decks without a second edit.
const pinnedFrom = {
  dependencies: ["next", "react", "react-dom", "server-only"],
  devDependencies: [
    "@tailwindcss/postcss",
    "@types/node",
    "@types/react",
    "@types/react-dom",
    "postcss",
    "tailwindcss",
    "typescript",
  ],
}

interface CopiedFile {
  contents: string
  target: string
}

function read(...segments: string[]): string {
  return fs.readFileSync(path.join(repoRoot, ...segments), "utf8")
}

function pick(source: Record<string, string>, names: string[]) {
  return Object.fromEntries(
    names.map((name) => {
      const version = source[name]

      if (!version) {
        throw new Error(
          `apps/playground/package.json has no "${name}" to pin the template to.`
        )
      }

      return [name, version]
    })
  )
}

function packageManagers(): Record<string, string> {
  const { packageManager } = JSON.parse(read("package.json")) as {
    packageManager?: string
  }

  if (!packageManager?.startsWith("pnpm@")) {
    throw new Error(
      'The root package.json has no "packageManager": "pnpm@<version>" to pin the template to.'
    )
  }

  return {
    bun: packageManagerPins.bun,
    npm: packageManagerPins.npm,
    pnpm: packageManager.slice("pnpm@".length),
    yarn: packageManagerPins.yarn,
  }
}

function versionsFile(): string {
  const playground = JSON.parse(read("apps/playground/package.json")) as {
    dependencies: Record<string, string>
    devDependencies: Record<string, string>
  }

  return `${JSON.stringify(
    {
      dependencies: pick(playground.dependencies, pinnedFrom.dependencies),
      devDependencies: pick(
        playground.devDependencies,
        pinnedFrom.devDependencies
      ),
      packageManagers: packageManagers(),
    },
    null,
    2
  )}\n`
}

function collect(): CopiedFile[] {
  return [
    ...blocks.map((file) => ({
      contents: read("apps/playground/app/slides/blocks", file),
      target: path.join("app/slides/blocks", file),
    })),
    { contents: versionsFile(), target: "versions.json" },
  ]
}

function check(files: CopiedFile[]): void {
  const stale = files.filter((file) => {
    const target = path.join(templateRoot, file.target)

    return (
      !fs.existsSync(target) ||
      fs.readFileSync(target, "utf8") !== file.contents
    )
  })

  if (stale.length === 0) {
    process.stdout.write(`template is in sync (${files.length} files)\n`)
    return
  }

  process.stderr.write(
    [
      `${stale.length} template file${stale.length === 1 ? "" : "s"} drifted from the canonical source:`,
      ...stale.map((file) => `  template/${file.target}`),
      "Run: pnpm --filter @deckard/cli exec node scripts/sync-template.ts",
      "",
    ].join("\n")
  )
  process.exit(1)
}

function sync(files: CopiedFile[]): void {
  for (const file of files) {
    const target = path.join(templateRoot, file.target)

    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, file.contents)
  }

  process.stdout.write(`template synced (${files.length} files)\n`)
}

const templateFiles = collect()

if (checkOnly) {
  check(templateFiles)
} else {
  sync(templateFiles)
}
