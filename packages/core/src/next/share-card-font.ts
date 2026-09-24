// Fetches the share card's display face from the Google Fonts CSS2 API at build
// time. The card renderer reads ttf, otf, or woff, and a theme ships woff2, so
// the stylesheet's own files cannot be used.

import type { SlideThemeCard } from "../deck/types"

type CardFontWeight = SlideThemeCard["font"]["weight"]

export interface CardFontFace {
  data: ArrayBuffer
  name: string
  style: "normal"
  weight: CardFontWeight
}

type Fetch = (url: string) => Promise<Response>

const fontSource = /src:\s*url\(\s*["']?([^"')]+)["']?\s*\)/

/** The first `src: url(...)` a Google Fonts stylesheet names, or nothing. */
export function readFontSource(css: string): string | undefined {
  return css.match(fontSource)?.[1]
}

/** The CSS2 API request for one static weight of a family, subset to `text`. */
export function googleFontCssUrl(
  family: string,
  weight: number,
  text: string
): string {
  const name = encodeURIComponent(family.trim()).replaceAll("%20", "+")

  return `https://fonts.googleapis.com/css2?family=${name}:wght@${weight}&text=${encodeURIComponent(text)}`
}

async function fetchFace(
  family: string,
  weight: number,
  text: string,
  fetcher: Fetch
): Promise<ArrayBuffer> {
  // Node's fetch sends no browser user agent, so the API answers with
  // truetype, which is a format the card renderer reads.
  const cssResponse = await fetcher(googleFontCssUrl(family, weight, text))

  if (!cssResponse.ok) {
    throw new Error(`the stylesheet request answered ${cssResponse.status}`)
  }

  const source = readFontSource(await cssResponse.text())

  if (!source) {
    throw new Error("the stylesheet names no font file")
  }

  const fontResponse = await fetcher(source)

  if (!fontResponse.ok) {
    throw new Error(`the font file request answered ${fontResponse.status}`)
  }

  return fontResponse.arrayBuffer()
}

const faces = new Map<string, Promise<CardFontFace | undefined>>()
const warned = new Set<string>()

/**
 * One weight of a family, subset to `text`, or nothing when the fetch fails:
 * an offline build, or a family Google Fonts does not carry. A failure logs one
 * warning per family and weight and never throws, so the card renders in the
 * default face instead of failing the build. Cached per family, weight, and
 * text for the life of the process.
 */
export function loadCardFont(
  family: string,
  weight: CardFontWeight,
  text: string,
  fetcher: Fetch = fetch
): Promise<CardFontFace | undefined> {
  const key = `${family}\u0000${weight}\u0000${text}`
  const cached = faces.get(key)

  if (cached) {
    return cached
  }

  const face = fetchFace(family, weight, text, fetcher).then(
    (data): CardFontFace => ({ data, name: family, style: "normal", weight }),
    (error: unknown): undefined => {
      const warning = `${family}\u0000${weight}`

      if (!warned.has(warning)) {
        warned.add(warning)
        console.warn(
          `[deckard] Share cards render without "${family}" ${weight}, because Google Fonts did not serve it (${error instanceof Error ? error.message : String(error)}). They use the default face instead.`
        )
      }
    }
  )

  faces.set(key, face)

  return face
}
