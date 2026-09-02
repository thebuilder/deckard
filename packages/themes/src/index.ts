import type { SlideTheme } from "@deckard/core"
import { blueprint } from "./blueprint/index"
import { type BuiltInThemeId, themeIds } from "./ids"
import { ledger } from "./ledger/index"
import { meridian } from "./meridian/index"
import { nexus } from "./nexus/index"
import { phosphor } from "./phosphor/index"
import { quorum } from "./quorum/index"

export { blueprint } from "./blueprint/index"
export { type BuiltInThemeId, defaultThemeId, themeIds } from "./ids"
export { ledger } from "./ledger/index"
export { meridian } from "./meridian/index"
export { nexus } from "./nexus/index"
export { phosphor } from "./phosphor/index"
export { quorum } from "./quorum/index"

// Keyed by id, so a theme named in ./ids with no module here, or a module here
// with no id there, is a type error rather than a gap someone finds later.
const themeById = {
  blueprint,
  ledger,
  meridian,
  nexus,
  phosphor,
  quorum,
} satisfies Record<BuiltInThemeId, SlideTheme>

/**
 * Every built-in, for something that has to enumerate them rather than pick
 * one: a gallery, a `--theme` flag, a count in a sentence. A deck imports the
 * one theme it renders instead, so the bundler can drop the rest.
 */
export const themes = themeIds.map((id) => themeById[id])
