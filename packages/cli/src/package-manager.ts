import fs from "node:fs"
import path from "node:path"
import process from "node:process"

export const packageManagers = ["bun", "npm", "pnpm", "yarn"] as const

export type PackageManager = (typeof packageManagers)[number]

export interface DetectedManager {
  name: PackageManager
  version: string | null
}

const lockfiles: [string, PackageManager][] = [
  ["pnpm-lock.yaml", "pnpm"],
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
  ["yarn.lock", "yarn"],
  ["package-lock.json", "npm"],
]

const versionPattern = /^\d+\.\d+\.\d+\S*/

export function isPackageManager(name: string): name is PackageManager {
  return (packageManagers as readonly string[]).includes(name)
}

// npm, pnpm, yarn, and bun all announce themselves here: "pnpm/10.18.1 npm/?
// node/v24.14.0". The version is the one that actually ran, so a generated deck
// records the manager it was created with rather than a guess.
export function fromUserAgent(
  agent: string | undefined = process.env.npm_config_user_agent
): DetectedManager | null {
  const [name, rest] = (agent ?? "").split("/")

  if (!(name && isPackageManager(name))) {
    return null
  }

  return { name, version: versionPattern.exec(rest ?? "")?.[0] ?? null }
}

function ancestors(directory: string): string[] {
  const chain = [path.resolve(directory)]

  let parent = path.dirname(chain[0])

  while (parent !== chain.at(-1)) {
    chain.push(parent)
    parent = path.dirname(parent)
  }

  return chain
}

export function fromLockfile(directory: string): PackageManager | null {
  for (const current of ancestors(directory)) {
    for (const [file, name] of lockfiles) {
      if (fs.existsSync(path.join(current, file))) {
        return name
      }
    }
  }

  return null
}

// What a deck was created with, for a command that has to name one. npm is the
// last resort because it is the one manager every node install already has.
export function detectPackageManager(directory: string): DetectedManager {
  const agent = fromUserAgent()

  if (agent) {
    return agent
  }

  return { name: fromLockfile(directory) ?? "npm", version: null }
}

function fromPackageJson(root: string): PackageManager | null {
  try {
    const { packageManager } = JSON.parse(
      fs.readFileSync(path.join(root, "package.json"), "utf8")
    ) as { packageManager?: string }
    const [name] = (packageManager ?? "").split("@")

    return name && isPackageManager(name) ? name : null
  } catch {
    return null
  }
}

// The deck decides, not the shell it is being run from: a deck built with npm
// keeps being an npm deck when someone runs the CLI through pnpm exec.
export function deckPackageManager(root: string): PackageManager {
  return (
    fromPackageJson(root) ??
    fromLockfile(root) ??
    fromUserAgent()?.name ??
    "npm"
  )
}

export function runScript(manager: PackageManager, script: string): string {
  return manager === "bun" ? `bun run ${script}` : `${manager} run ${script}`
}

export function execCommand(
  manager: PackageManager,
  command: string[]
): string {
  const line = command.join(" ")

  if (manager === "bun") {
    return `bunx ${line}`
  }

  return manager === "npm" ? `npm exec -- ${line}` : `${manager} exec ${line}`
}

export function addCommand(
  manager: PackageManager,
  dependency: string
): string {
  return manager === "npm"
    ? `npm install ${dependency}`
    : `${manager} add ${dependency}`
}

export function addDevCommand(
  manager: PackageManager,
  dependencies: string[]
): string {
  const line = dependencies.join(" ")

  return manager === "npm"
    ? `npm install -D ${line}`
    : `${manager} add -D ${line}`
}
