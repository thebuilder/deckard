#!/usr/bin/env node
import fs from "node:fs"
import process from "node:process"

import { type FlagSpec, type ParsedArgs, parseArgs } from "./args.ts"
import { runAdd } from "./commands/add.ts"
import { runCheckOverflow } from "./commands/check-overflow.ts"
import { runContactSheet } from "./commands/contact-sheet.ts"
import { runDoctor } from "./commands/doctor.ts"
import { runEject } from "./commands/eject.ts"
import { runExportPdf } from "./commands/export-pdf.ts"
import { runInit } from "./commands/init.ts"
import { runScreenshots } from "./commands/screenshots.ts"
import { runValidate } from "./commands/validate.ts"
import { fail, write } from "./output.ts"

const { version } = JSON.parse(
  fs.readFileSync(new URL("../package.json", import.meta.url), "utf8")
) as { version: string }

const previewFlags = ["light", "skip-build"]

const specs: Record<string, FlagSpec> = {
  add: { booleans: ["yes"], strings: ["registry"] },
  "check-overflow": { booleans: previewFlags, strings: ["port"] },
  "contact-sheet": { strings: ["columns"] },
  doctor: {},
  eject: { strings: ["theme"] },
  export: { booleans: ["dark", "skip-build"], strings: ["port"] },
  init: {
    booleans: ["empty", "git", "install"],
    strings: [
      "cli-tarball",
      "core-tarball",
      "package-manager",
      "registry",
      "theme",
      "themes-tarball",
    ],
  },
  screenshots: { booleans: previewFlags, strings: ["max", "port"] },
  validate: { strings: ["registry"] },
}

const help = `deckard ${version}

  deckard init <dir>          create a deck: a Next.js app with slides, a theme, and the checks
    --theme <name>               deckard, broadsheet, ledger, meridian, nexus,
                                 or phosphor (default deckard)
    --empty                      two slides instead of the sample deck
    --package-manager <name>     npm, pnpm, yarn, or bun (default: the one that ran init)
    --no-install                 write the files and stop
    --no-git                     skip git init and the first commit
    --core-tarball <path>        install @deckard/core from a local tarball
    --cli-tarball <path>         install @deckard/cli from a local tarball
    --themes-tarball <path>      install @deckard/themes from a local tarball
    --registry <url>             the @deckard registry for components.json

  deckard validate           load the deck, check its slides and its theme
    --registry <path>            also check a shadcn registry.json

  deckard doctor             check node, the package, the stylesheet, the deck, and the routes

  deckard check-overflow     fail on slides the canvas clips
  deckard screenshots        one PNG per slide at canvas size, into out/screenshots
    --max <n>                    stop after n slides
  deckard export pdf         one PDF page per slide, into out/slides.pdf
    --dark                       export the dark deck instead of the light one

  Those three build the app and serve it. They take --port <n> and --skip-build,
  and the two that are not the PDF export take --light.

  deckard contact-sheet      every screenshot in one grid, into out/contact-sheet.png
    --columns <n>                columns in the grid (default 4)

  contact-sheet builds nothing. It reads out/screenshots and the color mode
  those were captured in, so run deckard screenshots first.

  deckard add theme <name>   point deck/deck.ts at another built-in theme
  deckard eject theme        copy the built-in the deck uses into deck/theme, yours to edit
    --theme <name>               eject that built-in instead of the imported one
  deckard add block <name>   install a block from the registry, into app/slides/blocks
    --registry <url>             a registry URL carrying a {name} placeholder
    --yes                        overwrite the files it installs without asking

Every command except init runs against the deck in the current directory.
`

async function dispatch(argv: string[]): Promise<void> {
  const [name, ...rest] = argv

  if (!name || name === "--help" || name === "-h" || name === "help") {
    write(help)
    return
  }

  if (name === "--version" || name === "-v") {
    write(version)
    return
  }

  const spec = specs[name]

  if (!spec) {
    throw new Error(
      `Unknown command "${name}". Run deckard --help for the list.`
    )
  }

  const args = parseArgs(rest, spec)

  switch (name) {
    case "add":
      return await runAdd(args)
    case "check-overflow":
      return await runCheckOverflow(args)
    case "contact-sheet":
      return await runContactSheet(args)
    case "doctor":
      return await runDoctor()
    case "eject":
      return await runEject(args)
    case "export":
      return await runExport(args.positionals[0], args)
    case "init":
      return runInit(args, version)
    case "screenshots":
      return await runScreenshots(args)
    default:
      return await runValidate(args)
  }
}

function runExport(
  format: string | undefined,
  args: ParsedArgs
): Promise<void> {
  if (format !== "pdf") {
    throw new Error("deckard export takes one format: deckard export pdf")
  }

  return runExportPdf(args)
}

dispatch(process.argv.slice(2)).catch(fail)
