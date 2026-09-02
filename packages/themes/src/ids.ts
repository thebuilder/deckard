// The ids the built-in themes ship under, carrying none of the stylesheet
// imports the theme modules do, so a Node process can read the list without a
// CSS loader. Adding a theme starts here: add the id, then the module beside
// it, or ./index stops compiling.
export const themeIds = [
  "broadsheet",
  "deckard",
  "ledger",
  "meridian",
  "nexus",
  "phosphor",
] as const

export type BuiltInThemeId = (typeof themeIds)[number]
