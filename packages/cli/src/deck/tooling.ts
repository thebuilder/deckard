import { pathToFileURL } from "node:url"

import { addDevCommand, deckPackageManager } from "../package-manager.ts"
import { projectRoot, resolveFromProject } from "../project.ts"

// The browser and the PDF writer are the heaviest things the CLI touches, and
// only the capture commands need them. They install into the deck as dev
// dependencies, which init writes, and the CLI loads them from there. The CLI
// itself names them as optional peers, so `npx deckard init` never downloads
// them.
export const toolingPackages = ["playwright", "pdf-lib"] as const

export type ToolingPackage = (typeof toolingPackages)[number]

async function loadFromDeck<T>(name: ToolingPackage): Promise<T> {
  const resolved = resolveFromProject(name)

  if (!resolved) {
    throw new Error(
      `${name} does not resolve from this deck. The capture commands load it from the deck's own node_modules. Install it: ${addDevCommand(deckPackageManager(projectRoot), [name])}`
    )
  }

  // Both packages resolve to their CommonJS entry, which import() wraps as
  // `default`. Reading through it gives the same object require() would.
  const loaded = (await import(pathToFileURL(resolved).href)) as {
    default?: T
  } & T

  return loaded.default ?? loaded
}

export function loadPlaywright(): Promise<typeof import("playwright")> {
  return loadFromDeck("playwright")
}

export function loadPdfLib(): Promise<typeof import("pdf-lib")> {
  return loadFromDeck("pdf-lib")
}
