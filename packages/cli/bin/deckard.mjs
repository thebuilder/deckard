#!/usr/bin/env node
import fs from "node:fs"
import process from "node:process"

const entry = new URL("../dist/index.js", import.meta.url)

if (fs.existsSync(entry)) {
  await import(entry.href)
} else {
  process.stderr.write(
    "@thebuilder/deckard-cli has no build yet. Run: pnpm --filter @thebuilder/deckard-cli build\n"
  )
  process.exit(1)
}
