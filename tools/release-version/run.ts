#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

// Sets the version the three packages ship. The release workflow runs it with
// the number from the release tag, so the code never has to be bumped by hand
// before a release.
//
//   node tools/release-version/run.ts 0.2.6

const toolDirectory = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(toolDirectory, "../..")

// They version together: init pins a new deck to the CLI's own number for all
// three.
const manifests = [
  "packages/core/package.json",
  "packages/themes/package.json",
  "packages/cli/package.json",
]

// No prerelease suffix: npm would publish it as latest without a --tag.
const versionPattern = /^\d+\.\d+\.\d+$/

// The first "version" key is the package's own, near the top of the file. A
// line edit keeps the file byte-for-byte otherwise, so the formatter has
// nothing to say about the commit that carries it.
const versionLine = /^(\s*"version":\s*")[^"]*(")/m

function fail(message: string): never {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}

const [, , version] = process.argv

if (!(version && versionPattern.test(version))) {
  fail(
    `release:version takes a version like 0.2.6, got ${version ?? "nothing"}.`
  )
}

for (const manifest of manifests) {
  const file = path.join(repoRoot, manifest)
  const before = fs.readFileSync(file, "utf8")
  const previous = (JSON.parse(before) as { version: string }).version
  const after = before.replace(versionLine, `$1${version}$2`)

  if ((JSON.parse(after) as { version: string }).version !== version) {
    fail(`${manifest} has no top-level "version" to set.`)
  }

  fs.writeFileSync(file, after)
  process.stdout.write(`  ${manifest.padEnd(30)} ${previous} -> ${version}\n`)
}
