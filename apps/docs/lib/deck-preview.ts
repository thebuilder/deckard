export const themeNames = [
  "deckard",
  "broadsheet",
  "ledger",
  "meridian",
  "nexus",
  "phosphor",
] as const

export type ThemeName = (typeof themeNames)[number]
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

export interface GalleryEntry {
  background: BackgroundVariant
  defaultColorMode: ColorMode | "system"
  summary: string
}

export const galleryTheme: Record<ThemeName, GalleryEntry> = {
  broadsheet: {
    background: "default",
    defaultColorMode: "system",
    summary:
      "Print, not screen. Serif throughout, flat panels, hairline rules.",
  },
  deckard: {
    background: "default",
    defaultColorMode: "system",
    summary: "Quiet paper and one teal accent. Raised cards, a soft shadow.",
  },
  ledger: {
    background: "grid",
    defaultColorMode: "system",
    summary: "A bound report. Serif, sans, and mono, each with one job.",
  },
  meridian: {
    background: "default",
    defaultColorMode: "system",
    summary: "The quietest one. Flat surfaces, no shadow in either mode.",
  },
  nexus: {
    background: "grid",
    defaultColorMode: "dark",
    summary: "A flight console. Capitalised headings with an accent halo.",
  },
  phosphor: {
    background: "spotlight",
    defaultColorMode: "dark",
    summary: "A green CRT. Monospace everywhere, scanlines, a heading bloom.",
  },
}

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
