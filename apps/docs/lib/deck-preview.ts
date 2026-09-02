import fs from "node:fs"

import { defaultThemeId, themes } from "@deckard/themes"

import { resolveRepoFile } from "./repo-file"

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
  blueprint: {
    background: "grid",
    summary:
      "A drafting sheet. A ruled field, boxed numerals, hairline gutters.",
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
  quorum: {
    background: "default",
    summary: "A board pack. A tight scale, serif figures, no boxed cards.",
  },
} satisfies Record<string, GalleryCopy>

export type ThemeName = keyof typeof galleryCopy

/*
 * The theme a new deck opens in, for a page that has to render one rather than
 * all of them. Typed as a described theme, so a built-in that becomes the
 * default without a gallery entry is a type error here as well as a build
 * failure below.
 */
export const defaultTheme: ThemeName = defaultThemeId

export interface GalleryEntry extends GalleryCopy {
  defaultColorMode: ColorMode | "system"
}

// The theme a deck starts on leads, then the rest alphabetically. A rule rather
// than a list, so the order is not a second place the built-ins are written
// down.
const leadTheme = defaultThemeId

function compareThemes(left: string, right: string) {
  if (left === leadTheme || right === leadTheme) {
    return left === leadTheme ? -1 : 1
  }

  return left.localeCompare(right)
}

// The theme gallery page carries a section per theme, and every card links into
// it by anchor. The heading lives in MDX rather than in a loop over this list,
// because Astro builds the table of contents and the search index out of the
// page's own headings and a component's headings reach neither.
const galleryPage = "apps/docs/docs/02-themes.mdx"

function sectionedThemes(): string[] {
  const file = resolveRepoFile(galleryPage)

  if (file === null) {
    throw new Error(
      `[deck-preview] cannot find ${galleryPage} from this build, so the sections behind the gallery links go unchecked.`
    )
  }

  return [...fs.readFileSync(file, "utf8").matchAll(/^## (\S+)$/gm)].map(
    (match) => match[1] as string
  )
}

/*
 * @deckard/themes decides which themes exist. The docs decide how to describe
 * them, in three places that each go wrong quietly: a missing gallery entry
 * renders an empty caption, a missing stylesheet import in DeckPreview.astro
 * renders an unstyled card, and a missing section leaves every "read the notes"
 * link pointing at an anchor that is not there. Fail the build on the two this
 * module can see, and name the third.
 */
function readThemeNames(): ThemeName[] {
  const described = Object.keys(galleryCopy)
  const shipped = themes.map((theme) => theme.id)
  const missing = shipped.filter((id) => !described.includes(id))
  const stale = described.filter((id) => !shipped.includes(id))

  if (missing.length > 0) {
    throw new Error(
      `[deck-preview] @deckard/themes ships ${missing.join(", ")}, which apps/docs/lib/deck-preview.ts does not describe. Add a gallery entry here and a stylesheet import in components/DeckPreview.astro.`
    )
  }

  if (stale.length > 0) {
    throw new Error(
      `[deck-preview] apps/docs/lib/deck-preview.ts describes ${stale.join(", ")}, which @deckard/themes no longer ships.`
    )
  }

  const sections = sectionedThemes()
  const unwritten = shipped.filter((id) => !sections.includes(id))

  if (unwritten.length > 0) {
    throw new Error(
      `[deck-preview] ${galleryPage} has no "## ${unwritten[0]}" section, so the gallery card for ${unwritten.join(", ")} links to an anchor that is not on the page. Add a section with a <ThemePalette /> under it.`
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
