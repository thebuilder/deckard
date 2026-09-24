// The `@thebuilder/deckard-core/share-card` entry point. It stays off `/next`
// because next/og loads a WebAssembly renderer, and a deck that makes no cards
// never loads it.
import { ImageResponse } from "next/og"
import { getSlideById } from "../deck/resolve-slides"
import { homeColorMode } from "../deck/theme"
import type { Deck, SlideTheme, SlideThemeCardColors } from "../deck/types"
import type { CardFontWeight } from "../types/slides"
import { type CardFontFace, loadCardFont } from "./share-card-font"
import {
  cardTitleSize,
  neutralCardColors,
  type ShareCardText,
  shareCardAlt,
  shareCardSize,
  shareCardText,
} from "./share-card-layout"
import { slideParams } from "./slide-params"

// The weight the eyebrow and the footer are set in, in the title's family.
const textWeight: CardFontWeight = 400

// The title weight of a card drawn in the renderer's own face.
const neutralTitleWeight: CardFontWeight = 700

/** Everything a card is drawn with, resolved once from the deck's theme. */
interface CardStyle {
  colors: SlideThemeCardColors
  /** Set when the theme's face loaded. Without it the renderer's own face draws the card. */
  face?: { family: string; fonts: CardFontFace[] }
  titleWeight: CardFontWeight
  uppercase: boolean
}

async function loadFace(
  family: string,
  titleWeight: CardFontWeight,
  characters: string
): Promise<CardStyle["face"]> {
  const weights = [...new Set([titleWeight, textWeight])]
  const fonts = (
    await Promise.all(
      weights.map((weight) => loadCardFont(family, weight, characters))
    )
  ).filter((face) => face !== undefined)

  // With one weight loaded, every line draws in the nearest one the family has.
  return fonts.length > 0 ? { family, fonts } : undefined
}

async function resolveCardStyle(
  theme: SlideTheme,
  characters: string
): Promise<CardStyle> {
  const { card } = theme

  if (!card) {
    return {
      colors: neutralCardColors,
      titleWeight: neutralTitleWeight,
      uppercase: false,
    }
  }

  return {
    colors: card.colors[homeColorMode(theme)],
    face: await loadFace(card.font.family, card.font.weight, characters),
    titleWeight: card.font.weight,
    uppercase: card.font.uppercase ?? false,
  }
}

function ShareCard({ style, text }: { style: CardStyle; text: ShareCardText }) {
  const { colors, face, titleWeight, uppercase } = style

  return (
    <div
      style={{
        backgroundColor: colors.background,
        color: colors.foreground,
        display: "flex",
        flexDirection: "column",
        // The renderer reads an undefined value as a declaration and fails on
        // it, so the key is left out when its own face draws the card.
        ...(face ? { fontFamily: face.family } : {}),
        fontWeight: textWeight,
        height: "100%",
        padding: "64px 80px 60px",
        width: "100%",
      }}
    >
      <div
        style={{
          color: colors.muted,
          display: "flex",
          fontSize: 24,
          justifyContent: "space-between",
          letterSpacing: "0.14em",
        }}
      >
        <span>{text.eyebrow}</span>
        <span>{text.position}</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        <div
          style={{
            backgroundColor: colors.accent,
            height: 10,
            marginBottom: 36,
            width: 96,
          }}
        />
        <div
          style={{
            display: "block",
            fontSize: cardTitleSize(text.title, uppercase),
            fontWeight: titleWeight,
            letterSpacing: uppercase ? "0.01em" : "-0.02em",
            lineClamp: 3,
            lineHeight: 1.08,
          }}
        >
          {text.title}
        </div>
      </div>
      {text.footer ? (
        <div
          style={{
            color: colors.muted,
            display: "block",
            fontSize: 24,
            lineClamp: 2,
            lineHeight: 1.35,
            maxWidth: 880,
          }}
        >
          {text.footer}
        </div>
      ) : null}
    </div>
  )
}

/** Renders the share card for one slide, or nothing when the id names none. */
export async function renderSlideShareCard(
  deck: Deck,
  id: string
): Promise<ImageResponse | undefined> {
  const slide = getSlideById(deck.slides, id)

  if (!slide) {
    return undefined
  }

  const text = shareCardText(
    deck,
    slide,
    deck.theme.card?.font.uppercase ?? false
  )
  const style = await resolveCardStyle(deck.theme, text.characters)

  return new ImageResponse(<ShareCard style={style} text={text} />, {
    ...shareCardSize,
    fonts: style.face?.fonts,
  })
}

/**
 * The pieces an `app/slides/[id]/opengraph-image.tsx` route re-exports: one
 * designed card per slide, prerendered at build time.
 */
export function createSlideShareCard(deck: Deck) {
  // An image route is a route handler, which takes no params from the page
  // beside it, so it lists the slide ids itself.
  function generateStaticParams() {
    return slideParams(deck)
  }

  async function Image({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const response = await renderSlideShareCard(deck, id)

    return response ?? new Response("Not found", { status: 404 })
  }

  return {
    // One alt for every card: generateImageMetadata would give each its own,
    // but it moves the card under a second dynamic segment that the build does
    // not prerender.
    alt: shareCardAlt(deck),
    contentType: "image/png",
    generateStaticParams,
    Image,
    size: shareCardSize,
  }
}
