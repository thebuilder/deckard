import fs from "node:fs"
import { resolveRepoFile } from "./repo-file"
import { slideTokenNotes, type TokenGroup } from "./slide-token-notes"

const stylesheet = "packages/core/styles.css"
const specifier = "@deckard/core/styles.css"

export interface SlideTokenRow {
  /** The custom property, without the leading dashes. */
  name: string
  /** What the token controls, and which part of the runtime reads it. */
  note: string
  /** The neutral default, exactly as the stylesheet declares it. */
  value: string
}

function readStylesheet() {
  const file = resolveRepoFile(stylesheet, specifier)

  if (file === null) {
    throw new Error(
      `[slide-tokens] Cannot find ${stylesheet}. The token reference is generated from it, so the docs cannot build without it.`
    )
  }

  return fs.readFileSync(file, "utf8")
}

/** The `:root` block, comments removed, found by matching its own braces. */
function readRootBlock(css: string) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "")
  const selector = source.indexOf(":root")
  const open = source.indexOf("{", selector)

  if (selector === -1 || open === -1) {
    throw new Error(
      `[slide-tokens] ${stylesheet} declares no :root block. The token reference is generated from it.`
    )
  }

  let depth = 0

  for (let index = open; index < source.length; index += 1) {
    if (source[index] === "{") {
      depth += 1
    } else if (source[index] === "}") {
      depth -= 1

      if (depth === 0) {
        return source.slice(open + 1, index)
      }
    }
  }

  throw new Error(
    `[slide-tokens] The :root block in ${stylesheet} is never closed.`
  )
}

function readTokens() {
  const block = readRootBlock(readStylesheet())
  const tokens = [...block.matchAll(/--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g)].map(
    (match) => ({
      name: match[1],
      value: match[2]
        .replace(/\s+/g, " ")
        .replace(/\(\s+/g, "(")
        .replace(/\s+\)/g, ")")
        .trim(),
    })
  )

  if (tokens.length === 0) {
    throw new Error(
      `[slide-tokens] Parsed no custom properties out of the :root block in ${stylesheet}.`
    )
  }

  return tokens
}

const tokens = readTokens()
const declared = new Set(tokens.map((token) => token.name))

// A token nothing describes would ship as a blank cell, and a description for a
// token nobody declares would ship as a row for something that no longer
// exists. Both are build failures, so neither reaches the site.
for (const token of tokens) {
  if (!(token.name in slideTokenNotes)) {
    throw new Error(
      `[slide-tokens] ${stylesheet} declares --${token.name}, which apps/docs/lib/slide-token-notes.ts does not describe. Add a group and a description for it.`
    )
  }
}

for (const name of Object.keys(slideTokenNotes)) {
  if (!declared.has(name)) {
    throw new Error(
      `[slide-tokens] apps/docs/lib/slide-token-notes.ts describes --${name}, which ${stylesheet} no longer declares. Drop the row, or put the token back.`
    )
  }
}

/** Every token of one group, in the order the stylesheet declares them. */
export function slideTokenRows(group: TokenGroup): SlideTokenRow[] {
  const rows = tokens
    .filter((token) => slideTokenNotes[token.name].group === group)
    .map((token) => ({
      name: token.name,
      note: slideTokenNotes[token.name].note,
      value: token.value,
    }))

  if (rows.length === 0) {
    throw new Error(
      `[slide-tokens] No token is in the "${group}" group. Either the group name is a typo or every token left it.`
    )
  }

  return rows
}

/** How many tokens the contract declares, for prose that has to say. */
export const slideTokenCount = tokens.length

export interface NotePart {
  code: boolean
  text: string
}

/** A note split on its backticks, so the component can mark up the spans. */
export function splitNote(note: string): NotePart[] {
  return note
    .split("`")
    .map((text, index) => ({ code: index % 2 === 1, text }))
    .filter((part) => part.text.length > 0)
}
