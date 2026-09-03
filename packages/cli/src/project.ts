import { createRequire } from "node:module"
import path from "node:path"
import process from "node:process"

// The CLI lives outside the deck it works on, so the app is wherever the
// command was invoked from. A package script runs with its package as cwd.
export const projectRoot = process.cwd()

export function projectPath(...segments: string[]): string {
  return path.join(projectRoot, ...segments)
}

// Resolved against the deck, not against the CLI: the app installs its own
// @thebuilder/deckard-core, and that copy is the one the build compiles against.
export function resolveFromProject(specifier: string): string | null {
  try {
    return createRequire(projectPath("package.json")).resolve(specifier)
  } catch {
    return null
  }
}
