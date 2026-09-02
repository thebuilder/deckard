// The ids the built-in themes ship under, carrying none of the stylesheet
// imports the theme modules do, so a Node process can read the list without a
// CSS loader. Adding a theme starts here: add the id, then the module beside
// it, or ./index stops compiling.
export const themeIds = ["ledger", "meridian", "nexus", "phosphor"] as const

export type BuiltInThemeId = (typeof themeIds)[number]

// The theme a deck opens in when nothing has picked one: `deckard init` writes
// it, the CLI help names it as the default, and the docs gallery leads with it.
// One name here rather than one per consumer, so moving the default is an edit
// to this line.
export const defaultThemeId: BuiltInThemeId = "meridian"
