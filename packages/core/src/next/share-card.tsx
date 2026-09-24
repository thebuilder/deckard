import { ImageResponse } from "next/og"
import { getSlideById } from "../deck/resolve-slides"
import type { Deck, SlideThemeCard } from "../deck/types"
import { type CardFontFace, loadCardFont } from "./share-card-font"
import {
  cardTitleSize,
  neutralCardColors,
  type ShareCardText,
  shareCardSize,
  shareCardText,
} from "./share-card-layout"

// The weight the eyebrow and the footer are set in, in the title's family.
const textWeight: SlideThemeCard["font"]["weight"] = 400

async function loadFaces(
  card: SlideThemeCard | undefined,
  characters: string
): Promise<CardFontFace[] | undefined> {
  if (!card) {
    return undefined
  }

  const weights = [...new Set([card.font.weight, textWeight])]
  const faces = await Promise.all(
    weights.map((weight) => loadCardFont(card.font.family, weight, characters))
  )
  const loaded = faces.filter((face) => face !== undefined)

  // With no face the renderer falls back to its own. With one, every line
  // draws in the nearest weight the family loaded.
  return loaded.length > 0 ? loaded : undefined
}

function ShareCard({
  card,
  fontFamily,
  text,
}: {
  card: Omit<SlideThemeCard, "font"> & { font?: SlideThemeCard["font"] }
  fontFamily?: string
  text: ShareCardText
}) {
  const uppercase = card.font?.uppercase ?? false

  return (
    <div
      style={{
        backgroundColor: card.background,
        color: card.foreground,
        display: "flex",
        flexDirection: "column",
        // The renderer reads an undefined value as a declaration and fails on
        // it, so the key is left out when the default face draws the card.
        ...(fontFamily ? { fontFamily } : {}),
        fontWeight: textWeight,
        height: "100%",
        padding: "64px 80px 60px",
        width: "100%",
      }}
    >
      <div
        style={{
          color: card.muted,
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
            backgroundColor: card.accent,
            height: 10,
            marginBottom: 36,
            width: 96,
          }}
        />
        <div
          style={{
            display: "block",
            fontSize: cardTitleSize(text.title, uppercase),
            fontWeight: card.font?.weight ?? 700,
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
            color: card.muted,
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

  const { card } = deck.theme
  const text = shareCardText(deck, slide, card?.font.uppercase)
  const fonts = await loadFaces(card, text.characters)

  return new ImageResponse(
    <ShareCard
      card={card ?? neutralCardColors}
      fontFamily={fonts ? card?.font.family : undefined}
      text={text}
    />,
    { ...shareCardSize, fonts }
  )
}
