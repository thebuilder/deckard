import type { SlideTheme } from "@deckard/core"

import { broadsheet } from "./broadsheet/index"
import { deckard } from "./deckard/index"
import { type BuiltInThemeId, themeIds } from "./ids"
import { ledger } from "./ledger/index"
import { meridian } from "./meridian/index"
import { nexus } from "./nexus/index"
import { phosphor } from "./phosphor/index"

// Keyed by id, so a theme listed in ./ids without a module here, or a module
// without an id, is a type error rather than a gap someone finds later.
const themeById: Record<BuiltInThemeId, SlideTheme> = {
  broadsheet,
  deckard,
  ledger,
  meridian,
  nexus,
  phosphor,
}

export const themes: readonly SlideTheme[] = themeIds.map((id) => themeById[id])

export { broadsheet } from "./broadsheet/index"
export { deckard } from "./deckard/index"
export { type BuiltInThemeId, themeIds } from "./ids"
export { ledger } from "./ledger/index"
export { meridian } from "./meridian/index"
export { nexus } from "./nexus/index"
export { phosphor } from "./phosphor/index"
