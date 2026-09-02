import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)

// Neither cwd nor this module's own path is stable: Blume drives Astro from the
// generated .blume runtime, and the production build bundles this module into a
// chunk at a different depth than the source. Walking up for the directory that
// actually holds the repository is the only anchor that survives both.
function findRepoRoot(marker: string) {
  const starts = [process.cwd(), path.dirname(fileURLToPath(import.meta.url))]

  for (const start of starts) {
    let directory = start
    let parent = path.dirname(directory)

    while (directory !== parent) {
      if (fs.existsSync(path.join(directory, marker))) {
        return directory
      }

      directory = parent
      parent = path.dirname(directory)
    }
  }

  return null
}

/**
 * Absolute path to a file inside this repository, or null when the walk cannot
 * find it. `specifier` is the package subpath the same file is published under,
 * tried first so a docs build that resolves the packages from node_modules
 * reads the installed copy rather than nothing.
 */
export function resolveRepoFile(relativePath: string, specifier?: string) {
  if (specifier) {
    try {
      return require.resolve(specifier)
    } catch {
      // Fall through to the walk.
    }
  }

  const root = findRepoRoot(relativePath)

  return root === null ? null : path.join(root, relativePath)
}

/** Same, for a directory the walk anchors on rather than a file. */
export function resolveRepoDirectory(relativePath: string) {
  const root = findRepoRoot(relativePath)

  return root === null ? null : path.join(root, relativePath)
}
