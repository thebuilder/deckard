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
