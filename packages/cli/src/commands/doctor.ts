import fs from "node:fs"
import process from "node:process"

import { loadDeck } from "../deck/deck-module.ts"
import { write } from "../output.ts"
import { projectPath, resolveFromProject } from "../project.ts"

interface Check {
  detail: string
  fix?: string
  name: string
  ok: boolean
}

const minimumNodeMajor = 20
const styleImport = '@import "@deckard/core/styles.css"'

const routeAdapters = [
  { adapter: "createSlideRoute", file: "app/slides/[id]/page.tsx" },
  { adapter: "createPresenterPage", file: "app/presenter/page.tsx" },
  { adapter: "createDeckSitemap", file: "app/sitemap.ts" },
  { adapter: "createFirstSlideRedirect", file: "app/page.tsx" },
]

function read(relativePath: string): string | null {
  try {
    return fs.readFileSync(projectPath(relativePath), "utf8")
  } catch {
    return null
  }
}

function checkNode(): Check {
  const major = Number(process.versions.node.split(".")[0])

  return {
    detail: `node ${process.versions.node}`,
    fix: `Next 16 needs node ${minimumNodeMajor}.9 or newer. This repository runs node 24.`,
    name: "node",
    ok: major >= minimumNodeMajor,
  }
}

function checkCore(): Check {
  const resolved = resolveFromProject("@deckard/core/package.json")

  if (!resolved) {
    return {
      detail: "@deckard/core does not resolve from this directory",
      fix: "Install it: pnpm add @deckard/core. Run deckard from the app root, next to package.json.",
      name: "core",
      ok: false,
    }
  }

  const { version } = JSON.parse(fs.readFileSync(resolved, "utf8")) as {
    version?: string
  }

  return {
    detail: `@deckard/core ${version ?? "unknown"}`,
    name: "core",
    ok: true,
  }
}

function checkStylesheet(): Check {
  const css = read("app/globals.css")

  if (css === null) {
    return {
      detail: "app/globals.css is missing",
      fix: "The deck stylesheet is imported from the app stylesheet the root layout loads.",
      name: "styles",
      ok: false,
    }
  }

  const imported = css.includes(styleImport)

  return {
    detail: imported
      ? "app/globals.css imports the slide token contract"
      : `app/globals.css never imports ${styleImport}`,
    fix: `Add ${styleImport}; to app/globals.css. It carries the --slide-* tokens and registers the runtime's own Tailwind source.`,
    name: "styles",
    ok: imported,
  }
}

function checkRoutes(): Check {
  const missing = routeAdapters.filter((route) => {
    const source = read(route.file)

    return !source?.includes(route.adapter)
  })

  return {
    detail:
      missing.length === 0
        ? `${routeAdapters.length} route files re-export their adapter`
        : missing
            .map((route) => `${route.file} does not use ${route.adapter}`)
            .join("\n"),
    fix: "Route logic lives in @deckard/core/next. Each route file is a re-export of its adapter.",
    name: "routes",
    ok: missing.length === 0,
  }
}

async function checkDeck(): Promise<Check> {
  try {
    const deck = await loadDeck()

    return {
      detail: `deck/deck.ts loads ${deck.slides.length} slides for "${deck.title}"`,
      name: "deck",
      ok: true,
    }
  } catch (error) {
    return {
      detail: error instanceof Error ? error.message : String(error),
      fix: "deckard validate reports the same failure with the slide counts around it.",
      name: "deck",
      ok: false,
    }
  }
}

function print(checks: Check[]): void {
  const width = Math.max(...checks.map((check) => check.name.length)) + 2

  for (const check of checks) {
    const lines = [
      check.detail,
      ...(check.ok || !check.fix ? [] : [check.fix]),
    ].flatMap((line) => line.split("\n"))

    for (const [index, line] of lines.entries()) {
      const label =
        index === 0 ? `${check.ok ? "ok" : "FAIL"} ${check.name}` : ""

      write(`${label.padEnd(width + 5)}${line}`)
    }
  }
}

export async function runDoctor(): Promise<void> {
  const checks = [
    checkNode(),
    checkCore(),
    checkStylesheet(),
    checkRoutes(),
    await checkDeck(),
  ]

  print(checks)

  const failed = checks.filter((check) => !check.ok)

  if (failed.length === 0) {
    write("\ndeckard doctor found nothing wrong")
    return
  }

  process.stderr.write(
    `\ndeckard doctor found ${failed.length} problem${failed.length === 1 ? "" : "s"}\n`
  )
  process.exit(1)
}
