import type { Deck, ResolvedSlide, SlideThemeCard } from "../deck/types"

export const shareCardSize = { height: 630, width: 1200 }

// A theme with no card of its own, such as a deck's custom theme, gets this:
// grayscale, in the renderer's default face, so it names no brand.
export const neutralCardColors: Omit<SlideThemeCard, "font"> = {
  accent: "#0a0a0a",
  background: "#ffffff",
  foreground: "#0a0a0a",
  muted: "#666666",
}

const titleSteps = [
  { maxLength: 24, size: 96 },
  { maxLength: 48, size: 76 },
  { maxLength: 80, size: 62 },
] as const

const longTitleSize = 52

// Capitals set wider than mixed case, so an uppercase title steps down a size
// sooner.
const uppercaseWidth = 1.3

/**
 * The title's font size in pixels, stepped down by its length so a long title
 * still fits the card in three lines.
 */
export function cardTitleSize(title: string, uppercase = false): number {
  const length = title.trim().length * (uppercase ? uppercaseWidth : 1)

  return (
    titleSteps.find((step) => length <= step.maxLength)?.size ?? longTitleSize
  )
}

export interface ShareCardText {
  /** Every character the card draws, for subsetting the face it fetches. */
  characters: string
  eyebrow: string
  footer?: string
  position: string
  title: string
}

// The ellipsis a clamped line ends in has to be in the subset too.
const ellipsis = "…"

/** The words on a slide's card, cased the way the card draws them. */
export function shareCardText(
  deck: Pick<Deck, "description" | "header" | "slides" | "title">,
  slide: Pick<ResolvedSlide, "number" | "title">,
  uppercase = false
): ShareCardText {
  const brand = deck.header.brand.trim() || deck.title
  const eyebrow = brand.toUpperCase()
  const position = `${slide.number} / ${deck.slides.length}`
  const title = uppercase ? slide.title.toUpperCase() : slide.title
  const footer =
    deck.description.trim() || deck.header.meta?.trim() || undefined
  const characters = [
    ...new Set(`${eyebrow}${position}${title}${footer ?? ""}${ellipsis}`),
  ]
    .sort()
    .join("")

  return { characters, eyebrow, footer, position, title }
}

/** The alt text every card in a deck shares: what the image is and whose it is. */
export function shareCardAlt(deck: Pick<Deck, "header" | "title">): string {
  const brand = deck.header.brand.trim()

  return brand && brand !== deck.title
    ? `A slide from ${deck.title} by ${brand}`
    : `A slide from ${deck.title}`
}
