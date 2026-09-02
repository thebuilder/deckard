import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { BuiltInTheme } from "../deck/theme-source.ts"

// Relative to this module, so the template resolves the same way from a source
// checkout and from the installed package a tarball unpacks into.
const templateRoot = fileURLToPath(new URL("../../template/", import.meta.url))

export interface ScaffoldOptions {
  cliDependency: string
  coreDependency: string
  description: string
  name: string
  registryUrl: string
  sample: boolean
  target: string
  theme: BuiltInTheme
  themesDependency: string
  title: string
}

interface Versions {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
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
    .replaceAll("__DECK_THEME__", options.theme)
}

function write(target: string, contents: string): void {
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, contents)
}

function copyTree(from: string, to: string): void {
  fs.cpSync(from, to, { recursive: true })
}

// No packageManager field: corepack treats it as an enforcement
// lock, so writing the manager that happened to run init would refuse every
// other manager afterwards. Later deckard commands read the lockfile instead.
function packageJson(options: ScaffoldOptions): string {
  const versions = readVersions()

  return `${JSON.stringify(
    {
      name: options.name,
      version: "0.1.0",
      private: true,
      type: "module",
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
        "@deckard/themes": options.themesDependency,
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

  for (const file of ["next.config.ts", "postcss.config.ts", "tsconfig.json"]) {
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
