#!/usr/bin/env node
import { spawn } from "node:child_process"
import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

import { copyThemeAssets, watchThemeAssets } from "./copy-theme-assets.ts"

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)

// A themes dev run is two watchers: tsc for the modules and this process for the
// assets tsc never sees. They run under one node process rather than a shell
// "a & b" so that one Ctrl-C, or one signal from turbo, ends both. A leftover
// asset watcher writing into a dist nothing is compiling any more is worse than
// no watcher at all.
function tscEntry(): string {
  const entry = path.join(
    path.dirname(createRequire(import.meta.url).resolve("typescript")),
    "..",
    "bin",
    "tsc"
  )

  if (!fs.existsSync(entry)) {
    throw new Error(
      `typescript resolves from ${packageRoot} without a bin/tsc at ${entry}. Reinstall the workspace.`
    )
  }

  return entry
}

const tsc = spawn(
  process.execPath,
  [
    tscEntry(),
    "--project",
    "tsconfig.build.json",
    "--watch",
    "--preserveWatchOutput",
  ],
  { cwd: packageRoot, stdio: "inherit" }
)

tsc.on("exit", (code, signal) => {
  process.exit(signal ? 1 : (code ?? 0))
})

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    tsc.kill(signal)
  })
}

function report(copied: number): void {
  process.stdout.write(`theme assets copied (${copied} files)\n`)
}

report(copyThemeAssets())
watchThemeAssets(report)
