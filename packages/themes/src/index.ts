import { broadsheet } from "./broadsheet/index"
import { deckard } from "./deckard/index"
import { ledger } from "./ledger/index"
import { meridian } from "./meridian/index"
import { nexus } from "./nexus/index"
import { phosphor } from "./phosphor/index"

export { broadsheet } from "./broadsheet/index"
export { deckard } from "./deckard/index"
export { ledger } from "./ledger/index"
export { meridian } from "./meridian/index"
export { nexus } from "./nexus/index"
export { phosphor } from "./phosphor/index"

/**
 * Every built-in, for something that has to enumerate them rather than pick
 * one: a gallery, a `--theme` flag, a count in a sentence. A deck imports the
 * one theme it renders instead, so the bundler can drop the rest.
 */
export const themes = [
  broadsheet,
  deckard,
  ledger,
  meridian,
  nexus,
  phosphor,
] as const

export type BuiltInThemeId = (typeof themes)[number]["id"]
