import type { SlideTheme } from "@deckard/core"

import { atelier } from "./atelier/index"
import { aurora } from "./aurora/index"
import { blueprint } from "./blueprint/index"
import { cotton } from "./cotton/index"
import { type BuiltInThemeId, themeIds } from "./ids"
import { ledger } from "./ledger/index"
import { meridian } from "./meridian/index"
import { nexus } from "./nexus/index"
import { noir } from "./noir/index"
import { phosphor } from "./phosphor/index"
import { quorum } from "./quorum/index"

export { atelier } from "./atelier/index"
export { aurora } from "./aurora/index"
export { blueprint } from "./blueprint/index"
export { cotton } from "./cotton/index"
export { type BuiltInThemeId, defaultThemeId, themeIds } from "./ids"
export { ledger } from "./ledger/index"
export { meridian } from "./meridian/index"
export { nexus } from "./nexus/index"
export { noir } from "./noir/index"
export { phosphor } from "./phosphor/index"
export { quorum } from "./quorum/index"

// Keyed by id, so a theme named in ./ids with no module here, or a module here
// with no id there, is a type error rather than a gap someone finds later.
const themeById = {
  atelier,
  aurora,
  blueprint,
  cotton,
  ledger,
  meridian,
  nexus,
  noir,
  phosphor,
  quorum,
} satisfies Record<BuiltInThemeId, SlideTheme>

/**
 * Every built-in, for something that has to enumerate them rather than pick
 * one: a gallery, a `--theme` flag, a count in a sentence. A deck imports the
 * one theme it renders instead, so the bundler can drop the rest.
 */
export const themes = themeIds.map((id) => themeById[id])
