import { spawnSync } from "node:child_process"
import fs from "node:fs"
import process from "node:process"

import { booleanFlag, type ParsedArgs, stringFlag } from "../args.ts"
import { write } from "../output.ts"
import { projectPath, projectRoot } from "../project.ts"

const kinds = ["block", "theme"] as const

type Kind = (typeof kinds)[number]

function readRegistryUrl(): string | null {
  try {
    const config = JSON.parse(
      fs.readFileSync(projectPath("components.json"), "utf8")
    ) as { registries?: Record<string, string | { url?: string }> }
    const entry = config.registries?.["@deckard"]

    if (typeof entry === "string") {
      return entry
    }

    return entry?.url ?? null
  } catch {
    return null
  }
}

function itemUrl(template: string, item: string): string | null {
  try {
    return new URL(template.replace("{name}", item)).toString()
  } catch {
    return null
  }
}

async function assertReachable(url: string): Promise<void> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(5000),
  }).catch(() => null)

  if (response?.ok) {
    return
  }

  throw new Error(
    [
      `The registry at ${url} did not answer${response ? ` (HTTP ${response.status})` : ""}.`,
      "Deckard has no public registry host yet. The docs app in the Deckard repository serves it on port 3001:",
      "",
      "  pnpm --filter docs dev",
      "",
      "Start that, or pass the host it is on with --registry <url>. The URL carries a {name} placeholder.",
    ].join("\n")
  )
}

function exampleFor(kind: Kind): string {
  return kind === "theme" ? "deckard or broadsheet" : "typography or media"
}

export async function runAdd(args: ParsedArgs): Promise<void> {
  const [kind, name] = args.positionals

  if (!(kinds as readonly string[]).includes(kind)) {
    throw new Error(
      `deckard add takes ${kinds.join(" or ")}, not "${kind ?? ""}". Try: deckard add theme broadsheet`
    )
  }

  if (!name) {
    throw new Error(
      `deckard add ${kind} needs a name, such as ${exampleFor(kind as Kind)}.`
    )
  }

  const item = `${kind}-${name}`
  const override = stringFlag(args, "registry")
  const template = override ?? readRegistryUrl()

  if (!template) {
    throw new Error(
      [
        "No @deckard registry in components.json and no --registry flag.",
        'Add one: { "registries": { "@deckard": "http://localhost:3001/r/{name}.json" } }',
      ].join("\n")
    )
  }

  const url = itemUrl(template, item)

  if (!url) {
    throw new Error(
      `The @deckard registry entry "${template}" is not a URL. It should look like http://localhost:3001/r/{name}.json`
    )
  }

  await assertReachable(url)

  write(`Installing @deckard/${item} from ${url}`)

  // The namespace resolves through components.json. A --registry run bypasses
  // that file, so shadcn takes the URL itself.
  const target = override ? url : `@deckard/${item}`
  const confirmed = booleanFlag(args, "yes") ? ["-y", "-o"] : []
  const result = spawnSync(
    "pnpm",
    ["dlx", "shadcn@latest", "add", target, ...confirmed],
    {
      cwd: projectRoot,
      env: process.env,
      stdio: "inherit",
    }
  )

  if (result.status !== 0) {
    throw new Error(`shadcn add ${target} failed.`)
  }
}
