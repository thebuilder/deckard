import fs from "node:fs"
import path from "node:path"
import process from "node:process"

// The harness lives outside the deck it checks, so the app is wherever the
// script was invoked from. pnpm runs a package script with the package as cwd.
export const projectRoot = process.cwd()

function findWorkspaceRoot(from: string): string {
  let directory = from

  for (;;) {
    if (fs.existsSync(path.join(directory, "pnpm-workspace.yaml"))) {
      return directory
    }

    const parent = path.dirname(directory)

    if (parent === directory) {
      return from
    }

    directory = parent
  }
}

// A published deck has no workspace above it, so this falls back to the app.
export const workspaceRoot = findWorkspaceRoot(projectRoot)
