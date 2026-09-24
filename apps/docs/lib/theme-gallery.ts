import fs from "node:fs"

import { homeColorMode } from "@thebuilder/deckard-core"
import { defaultThemeId, themes } from "@thebuilder/deckard-themes"

import { resolveRepoFile } from "./repo-file"
import type { PreviewColorMode } from "./slide-previews"

/*
 * The copy a card carries, keyed by theme. This is the human half: what a
 * theme already states about itself, the color mode it opens on included, is
 * read off the theme object rather than restated here, and a built-in with no
 * entry fails the build.
 */
export interface GalleryCopy {
  summary: string
}

const galleryCopy = {
  atelier: {
    summary: "A print poster. Hard rules, flat colour blocks, no radius.",
  },
  aurora: {
    summary: "A live field behind the opener, the breaks, and the close.",
  },
  blueprint: {
    summary:
      "A drafting sheet. A ruled field, boxed numerals, hairline gutters.",
  },
  cotton: {
    summary: "Large radii, one soft shadow, and tints instead of lines.",
  },
  ledger: {
    summary: "A bound report. Serif, sans, and mono, each with one job.",
  },
  meridian: {
    summary: "The quietest one. Flat surfaces, no shadow in either mode.",
  },
  nexus: {
    summary: "A flight console. Capitalised headings with an accent halo.",
  },
  noir: {
    summary: "A lookbook. Hairlines, centred layouts, and no mono face.",
  },
  phosphor: {
    summary: "A green CRT. Monospace everywhere, scanlines, a heading bloom.",
  },
  quorum: {
    summary: "A board pack. A tight scale, serif figures, no boxed cards.",
  },
} satisfies Record<string, GalleryCopy>

export type ThemeName = keyof typeof galleryCopy

export interface GalleryEntry extends GalleryCopy {
  defaultColorMode: PreviewColorMode | "system"
  /* The mode the docs show the theme in: its own default, or light for a
   * theme that follows the system. */
  homeMode: PreviewColorMode
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
      `[theme-gallery] cannot find ${galleryPage} from this build, so the sections behind the gallery links go unchecked.`
    )
  }

  return [...fs.readFileSync(file, "utf8").matchAll(/^## (\S+)$/gm)].map(
    (match) => match[1] as string
  )
}

/*
 * @thebuilder/deckard-themes decides which themes exist. The docs describe them
 * in two places that each go wrong quietly: a missing gallery entry renders an
 * empty caption, and a missing section leaves every link into the gallery
 * pointing at an anchor that is not there. Fail the build on both. A theme
 * nobody captured fails it too, in previewSrc.
 */
function readThemeNames(): ThemeName[] {
  const described = Object.keys(galleryCopy)
  const shipped = themes.map((theme) => theme.id)
  const missing = shipped.filter((id) => !described.includes(id))
  const stale = described.filter((id) => !shipped.includes(id))

  if (missing.length > 0) {
    throw new Error(
      `[theme-gallery] @thebuilder/deckard-themes ships ${missing.join(", ")}, which apps/docs/lib/theme-gallery.ts does not describe. Add a gallery entry here.`
    )
  }

  if (stale.length > 0) {
    throw new Error(
      `[theme-gallery] apps/docs/lib/theme-gallery.ts describes ${stale.join(", ")}, which @thebuilder/deckard-themes no longer ships.`
    )
  }

  const sections = sectionedThemes()
  const unwritten = shipped.filter((id) => !sections.includes(id))

  if (unwritten.length > 0) {
    throw new Error(
      `[theme-gallery] ${galleryPage} has no "## ${unwritten[0]}" section, so the gallery card for ${unwritten.join(", ")} links to an anchor that is not on the page. Add a section with a <ThemePalette /> under it.`
    )
  }

  return shipped.sort(compareThemes) as ThemeName[]
}

export const themeNames: readonly ThemeName[] = readThemeNames()

const byId = new Map(themes.map((theme) => [theme.id, theme]))

function galleryEntry(name: ThemeName): GalleryEntry {
  const theme = byId.get(name)

  // readThemeNames only lists themes the package ships.
  if (!theme) {
    throw new Error(
      `[theme-gallery] @thebuilder/deckard-themes has no ${name}.`
    )
  }

  return {
    ...galleryCopy[name],
    defaultColorMode: theme.defaultColorMode,
    homeMode: homeColorMode(theme),
  }
}

export const galleryTheme = Object.fromEntries(
  themeNames.map((name) => [name, galleryEntry(name)])
) as Record<ThemeName, GalleryEntry>
