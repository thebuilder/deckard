import { themes } from "@deckard/themes"

export type ColorMode = "light" | "dark"
export type BackgroundVariant = "default" | "grid" | "spotlight" | "none"
export type PreviewLayout = "breaker" | "bullets" | "figures" | "hero" | "panel"

export interface PreviewFigure {
  caption: string
  unit?: string
  value: string
}

export interface PreviewSlide {
  brand: string
  bullets?: string[]
  eyebrow: string
  figures?: PreviewFigure[]
  footnote?: string
  heading: string
  layout?: PreviewLayout
  lead?: string
  meta?: string
  number: number
  title?: string
  total: number
}

/*
 * The copy a card carries, keyed by theme. This is the human half: what a
 * theme already states about itself, the color mode it opens on included, is
 * read off the theme object rather than restated here, and a built-in with no
 * entry fails the build.
 */
export interface GalleryCopy {
  background: BackgroundVariant
  summary: string
}

const galleryCopy = {
  broadsheet: {
    background: "default",
    summary:
      "Print, not screen. Serif throughout, flat panels, hairline rules.",
  },
  deckard: {
    background: "default",
    summary: "Quiet paper and one teal accent. Raised cards, a soft shadow.",
  },
  ledger: {
    background: "grid",
    summary: "A bound report. Serif, sans, and mono, each with one job.",
  },
  meridian: {
    background: "default",
    summary: "The quietest one. Flat surfaces, no shadow in either mode.",
  },
  nexus: {
    background: "grid",
    summary: "A flight console. Capitalised headings with an accent halo.",
  },
  phosphor: {
    background: "spotlight",
    summary: "A green CRT. Monospace everywhere, scanlines, a heading bloom.",
  },
} satisfies Record<string, GalleryCopy>

export type ThemeName = keyof typeof galleryCopy

export interface GalleryEntry extends GalleryCopy {
  defaultColorMode: ColorMode | "system"
}

// The theme a deck starts on leads, then the rest alphabetically. A rule rather
// than a list, so the order is not a second place the built-ins are written
// down.
const leadTheme = "deckard"

function compareThemes(left: string, right: string) {
  if (left === leadTheme || right === leadTheme) {
    return left === leadTheme ? -1 : 1
  }

  return left.localeCompare(right)
}

/*
 * @deckard/themes decides which themes exist. This page decides how to
 * describe them, and DeckPreview.astro imports each stylesheet by name, so a
 * built-in that reaches the package without reaching either one would render
 * as an unstyled card with an empty caption. Fail the build instead.
 */
function readThemeNames(): ThemeName[] {
  const described = Object.keys(galleryCopy)
  const shipped = themes.map((theme) => theme.id)
  const missing = shipped.filter((id) => !described.includes(id))
  const stale = described.filter((id) => !shipped.includes(id))

  if (missing.length > 0) {
    throw new Error(
      `[deck-preview] @deckard/themes ships ${missing.join(", ")}, which apps/docs/lib/deck-preview.ts does not describe. Add a gallery entry, a stylesheet import in components/DeckPreview.astro, and a section on the theme gallery page.`
    )
  }

  if (stale.length > 0) {
    throw new Error(
      `[deck-preview] apps/docs/lib/deck-preview.ts describes ${stale.join(", ")}, which @deckard/themes no longer ships.`
    )
  }

  return shipped.sort(compareThemes) as ThemeName[]
}

export const themeNames: readonly ThemeName[] = readThemeNames()

/** How many themes ship, for a sentence that has to say. */
export const themeCount = themeNames.length

const numberWords = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
]

/** The same count, spelled, for prose that would read badly with a digit. */
export const themeCountWord = numberWords[themeCount] ?? String(themeCount)

const byId = new Map(themes.map((theme) => [theme.id, theme]))

export const galleryTheme = Object.fromEntries(
  themeNames.map((name) => [
    name,
    {
      ...galleryCopy[name],
      defaultColorMode: byId.get(name)?.defaultColorMode ?? "system",
    },
  ])
) as Record<ThemeName, GalleryEntry>

export const gallerySlide: PreviewSlide = {
  brand: "Acme",
  eyebrow: "Quarter in review",
  figures: [
    { caption: "Median deck build, down from 41 seconds", value: "6.2s" },
    { caption: "Slides that needed a fix after export", unit: "%", value: "0" },
    { caption: "Talks rebuilt on the new deck this quarter", value: "31" },
  ],
  footnote:
    "Source: the deploy log, 1 January to 31 March. Build times are the median of the last twenty runs on each deck.",
  heading: "The three numbers that moved",
  layout: "panel",
  lead: "Every figure says what it is measured against, because a number on a slide with no comparison is decoration. These three carried the quarter.",
  meta: "March 2026",
  number: 7,
  title: "The numbers",
  total: 18,
}
