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
const templateSource = path.join(packageRoot, "template-src")
const templateRoot = path.join(packageRoot, "template")

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

interface GeneratedFile {
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

function generated(): GeneratedFile[] {
  return [
    ...blocks.map((file) => ({
      contents: read("apps/playground/app/slides/blocks", file),
      target: path.join("app/slides/blocks", file),
    })),
    { contents: versionsFile(), target: "versions.json" },
  ]
}

function countFiles(directory: string): number {
  return fs
    .readdirSync(directory, { recursive: true })
    .filter((entry) =>
      fs.statSync(path.join(directory, String(entry))).isFile()
    ).length
}

function sync(): void {
  const files = generated()

  fs.rmSync(templateRoot, { force: true, recursive: true })
  fs.cpSync(templateSource, templateRoot, { recursive: true })

  for (const file of files) {
    const target = path.join(templateRoot, file.target)

    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, file.contents)
  }

  process.stdout.write(`template built (${countFiles(templateRoot)} files)\n`)
}

sync()
