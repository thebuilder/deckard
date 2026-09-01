import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import type { DetectedManager } from "../package-manager.ts"

// Relative to this module, so the template resolves the same way from a source
// checkout and from the installed package a tarball unpacks into.
const templateRoot = fileURLToPath(new URL("../../template/", import.meta.url))

export type ThemeName =
  | "broadsheet"
  | "deckard"
  | "ledger"
  | "meridian"
  | "nexus"
  | "phosphor"

export interface ScaffoldOptions {
  cliDependency: string
  coreDependency: string
  description: string
  name: string
  packageManager: DetectedManager
  registryUrl: string
  sample: boolean
  target: string
  theme: ThemeName
  title: string
}

interface Versions {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  packageManagers: Record<string, string>
}

function templatePath(...segments: string[]): string {
  return path.join(templateRoot, ...segments)
}

function readTemplate(...segments: string[]): string {
  return fs.readFileSync(templatePath(...segments), "utf8")
}

function readVersions(): Versions {
  return JSON.parse(readTemplate("versions.json")) as Versions
}

function sortedEntries(entries: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(entries).sort(([left], [right]) => left.localeCompare(right))
  )
}

function fill(source: string, options: ScaffoldOptions): string {
  return source
    .replaceAll("__DECK_TITLE__", options.title)
    .replaceAll("__DECK_DESCRIPTION__", options.description)
}

function write(target: string, contents: string): void {
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, contents)
}

function copyTree(from: string, to: string): void {
  fs.cpSync(from, to, { recursive: true })
}

// The manager that ran init reports its own version, so the field records what
// actually built the deck. A forced --package-manager falls back to the pin the
// template carries.
function packageManagerField(
  manager: DetectedManager,
  pins: Record<string, string>
): string {
  return `${manager.name}@${manager.version ?? pins[manager.name]}`
}

function packageJson(options: ScaffoldOptions): string {
  const versions = readVersions()

  return `${JSON.stringify(
    {
      name: options.name,
      version: "0.1.0",
      private: true,
      type: "module",
      packageManager: packageManagerField(
        options.packageManager,
        versions.packageManagers
      ),
      scripts: {
        build: "next build",
        "deck:check-overflow": "deckard check-overflow",
        "deck:contact-sheet": "deckard contact-sheet",
        "deck:doctor": "deckard doctor",
        "deck:screenshots": "deckard screenshots",
        "deck:validate": "deckard validate",
        dev: "next dev --turbopack",
        "export:pdf": "deckard export pdf",
        start: "next start",
        typecheck: "next typegen && tsc --noEmit",
      },
      dependencies: sortedEntries({
        "@deckard/core": options.coreDependency,
        ...versions.dependencies,
      }),
      devDependencies: sortedEntries({
        "@deckard/cli": options.cliDependency,
        ...versions.devDependencies,
      }),
    },
    null,
    2
  )}\n`
}

function componentsJson(options: ScaffoldOptions): string {
  return `${JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema.json",
      style: "base-nova",
      rsc: true,
      tsx: true,
      tailwind: {
        config: "",
        css: "app/globals.css",
        baseColor: "neutral",
        cssVariables: true,
        prefix: "",
      },
      iconLibrary: "lucide",
      rtl: false,
      aliases: {
        components: "@/components",
        hooks: "@/hooks",
        lib: "@/lib",
        ui: "@/components/ui",
        utils: "@/lib/utils",
      },
      registries: {
        "@deckard": options.registryUrl,
      },
    },
    null,
    2
  )}\n`
}

const gitignore = `node_modules/
.next/
out/
next-env.d.ts
*.tsbuildinfo
.DS_Store
.env*.local
`

export function scaffold(options: ScaffoldOptions): void {
  const { target } = options

  copyTree(templatePath("app"), path.join(target, "app"))
  copyTree(templatePath("lib"), path.join(target, "lib"))
  copyTree(templatePath("public"), path.join(target, "public"))
  copyTree(
    templatePath("deck/theme", options.theme),
    path.join(target, "deck/theme")
  )

  for (const file of [
    "next.config.mjs",
    "postcss.config.mjs",
    "tsconfig.json",
  ]) {
    write(path.join(target, file), readTemplate(file))
  }

  write(
    path.join(target, "deck/deck.ts"),
    fill(readTemplate("deck/deck.ts"), options)
  )

  const variant = options.sample ? "sample" : "empty"

  write(
    path.join(target, "deck/slides.tsx"),
    fill(readTemplate("deck", variant, "slides.tsx"), options)
  )

  if (options.sample) {
    copyTree(
      templatePath("deck/sample/slides"),
      path.join(target, "deck/slides")
    )
  }

  write(path.join(target, "package.json"), packageJson(options))
  write(path.join(target, "components.json"), componentsJson(options))
  write(path.join(target, ".gitignore"), gitignore)
}
