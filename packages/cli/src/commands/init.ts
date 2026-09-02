import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import process from "node:process"

import {
  booleanFlag,
  choiceFlag,
  type ParsedArgs,
  stringFlag,
} from "../args.ts"
import {
  type BuiltInTheme,
  builtInThemes,
  defaultTheme,
} from "../deck/theme-source.ts"
import { scaffold } from "../init/scaffold.ts"
import { write } from "../output.ts"
import {
  type DetectedManager,
  detectPackageManager,
  isPackageManager,
  type PackageManager,
  packageManagers,
  runScript,
} from "../package-manager.ts"

const defaultRegistryUrl = "http://localhost:3001/r/{name}.json"
const namePattern = /[^a-z0-9-]+/g

function toPackageName(directory: string): string {
  const name = path
    .basename(path.resolve(directory))
    .toLowerCase()
    .replaceAll(namePattern, "-")
    .replace(/^-+|-+$/g, "")

  return name.length > 0 ? name : "deck"
}

function toTitle(name: string): string {
  const words = name.split("-").filter((word) => word.length > 0)
  const first = words[0] ?? "Deck"

  return [first[0].toUpperCase() + first.slice(1), ...words.slice(1)].join(" ")
}

function assertEmptyTarget(target: string): void {
  if (!fs.existsSync(target)) {
    return
  }

  const entries = fs.readdirSync(target)

  if (entries.length > 0) {
    throw new Error(
      `${target} already has ${entries.length} file${entries.length === 1 ? "" : "s"} in it. Pick an empty directory.`
    )
  }
}

function tarballDependency(flag: string | undefined, fallback: string): string {
  if (!flag) {
    return fallback
  }

  const resolved = path.resolve(process.cwd(), flag)

  if (!fs.existsSync(resolved)) {
    throw new Error(`No tarball at ${resolved}.`)
  }

  return `file:${resolved}`
}

function run(command: string, args: string[], cwd: string): boolean {
  return spawnSync(command, args, { cwd, stdio: "inherit" }).status === 0
}

function install(manager: PackageManager, target: string): void {
  write(`\nInstalling dependencies with ${manager}`)

  if (!run(manager, ["install"], target)) {
    throw new Error(
      `${manager} install failed in ${target}. The app is written; fix the install and run it again there.`
    )
  }
}

function initialCommit(target: string): void {
  if (!run("git", ["init", "--quiet"], target)) {
    write("git init failed, so the deck is not a repository yet.")
    return
  }

  run("git", ["add", "-A"], target)

  const committed = run(
    "git",
    ["commit", "--quiet", "-m", "Create the deck"],
    target
  )

  if (!committed) {
    write(
      "git commit failed, which usually means git has no user.name or user.email here. The files are staged."
    )
  }
}

function doctor(manager: PackageManager, target: string): boolean {
  write("\nTypechecking the new deck")

  return run(manager, ["run", "typecheck"], target)
}

function nextSteps(
  directory: string,
  manager: PackageManager,
  installed: boolean
): string[] {
  const steps = [`cd ${directory}`]

  if (!installed) {
    steps.push(`${manager} install`)
  }

  steps.push(runScript(manager, "dev"))

  return steps
}

// The flag wins, then the manager that invoked this run, then a lockfile above
// the target. Nothing here assumes pnpm: npx on a machine without it lands on
// npm and the generated deck says so.
function chooseManager(args: ParsedArgs, target: string): DetectedManager {
  const forced = stringFlag(args, "package-manager")

  if (forced === undefined) {
    return detectPackageManager(path.dirname(target))
  }

  if (!isPackageManager(forced)) {
    throw new Error(
      `--package-manager takes one of ${packageManagers.join(", ")}, not "${forced}".`
    )
  }

  const detected = detectPackageManager(path.dirname(target))

  return detected.name === forced ? detected : { name: forced, version: null }
}

export function runInit(args: ParsedArgs, cliVersion: string): void {
  const [directory] = args.positionals

  if (!directory) {
    throw new Error("deckard init needs a directory: deckard init my-talk")
  }

  const target = path.resolve(process.cwd(), directory)

  assertEmptyTarget(target)

  const detected = chooseManager(args, target)
  const manager = detected.name
  const theme: BuiltInTheme = choiceFlag(
    args,
    "theme",
    builtInThemes,
    defaultTheme
  )
  const sample = !booleanFlag(args, "empty")
  const name = toPackageName(target)
  const title = toTitle(name)

  scaffold({
    cliDependency: tarballDependency(
      stringFlag(args, "cli-tarball"),
      `^${cliVersion}`
    ),
    coreDependency: tarballDependency(
      stringFlag(args, "core-tarball"),
      `^${cliVersion}`
    ),
    description: `${title}, a deck built with Deckard.`,
    name,
    registryUrl: stringFlag(args, "registry") ?? defaultRegistryUrl,
    sample,
    target,
    theme,
    themesDependency: tarballDependency(
      stringFlag(args, "themes-tarball"),
      `^${cliVersion}`
    ),
    title,
  })

  write(`Created ${name} in ${target}`)
  write(`  ${theme} theme, ${sample ? "sample deck" : "two empty slides"}`)
  write(`  ${manager} is the package manager for this deck`)

  const installed = booleanFlag(args, "install", true)

  if (installed) {
    install(manager, target)
  }

  if (booleanFlag(args, "git", true)) {
    initialCommit(target)
  }

  const healthy = installed ? doctor(manager, target) : true

  write("")

  for (const step of nextSteps(directory, manager, installed)) {
    write(`  ${step}`)
  }

  write("")
  write(
    "Slides are deck/slides.tsx. The theme is imported from @deckard/themes; run deckard eject theme to own a copy of it."
  )

  if (!healthy) {
    throw new Error(
      "The deck is written but the typecheck failed. The output above says what is missing."
    )
  }
}
