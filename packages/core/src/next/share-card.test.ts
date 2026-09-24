import { afterEach, describe, expect, it, vi } from "vitest"
import { defineDeck } from "../deck/define-deck"
import { createSlideShareCard } from "./share-card"
import {
  googleFontCssUrl,
  loadCardFont,
  readFontSource,
} from "./share-card-font"
import { cardTitleSize, shareCardAlt, shareCardText } from "./share-card-layout"

const deck = defineDeck({
  description: "A share card test deck",
  footer: { mode: "visible" },
  header: { brand: "Acme", href: "/", meta: "Q1 review", mode: "auto" },
  slides: [
    { body: null, slug: "opening", title: "What we shipped" },
    { body: null, slug: "numbers" },
  ],
  title: "What we shipped",
})

const googleCss = `/* latin */
@font-face {
  font-family: 'Source Serif 4';
  font-style: normal;
  font-weight: 600;
  src: url(https://fonts.gstatic.com/l/font?kit=abc&skey=def&v=v14) format('truetype');
}
`

describe("cardTitleSize", () => {
  it("steps down as the title gets longer", () => {
    const sizes = [
      "Opening",
      "Why decks drift from their source",
      "What we shipped in the first quarter and what it cost us",
      "A title long enough that it only fits the card in three lines at the smallest size the card sets",
    ].map((title) => cardTitleSize(title))

    expect(sizes).toEqual([...sizes].sort((a, b) => b - a))
    expect(new Set(sizes).size).toBe(sizes.length)
  })

  it("steps an uppercase title down sooner", () => {
    const title = "Why decks drift"

    expect(cardTitleSize(title, true)).toBeLessThanOrEqual(cardTitleSize(title))
    expect(cardTitleSize("Why decks drift apart", true)).toBeLessThan(
      cardTitleSize("Why decks drift apart")
    )
  })
})

describe("shareCardText", () => {
  it("sets the brand, the position, and the description", () => {
    const text = shareCardText(deck, deck.slides[1])

    expect(text).toMatchObject({
      eyebrow: "ACME",
      footer: "A share card test deck",
      position: "2 / 2",
      title: "Slide 2",
    })
  })

  it("uppercases the title when the theme does, and subsets every character it draws", () => {
    const text = shareCardText(deck, deck.slides[0], true)

    expect(text.title).toBe("WHAT WE SHIPPED")

    for (const character of `${text.eyebrow}${text.position}${text.title}${text.footer}…`) {
      expect(text.characters).toContain(character)
    }

    expect(new Set(text.characters).size).toBe(text.characters.length)
  })

  it("falls back to the header meta without a description", () => {
    expect(
      shareCardText({ ...deck, description: " " }, deck.slides[0]).footer
    ).toBe("Q1 review")
  })
})

describe("shareCardAlt", () => {
  it("names the deck, and the brand when it differs", () => {
    expect(shareCardAlt(deck)).toBe("A slide from What we shipped by Acme")
    expect(
      shareCardAlt({
        header: { ...deck.header, brand: "Deckard" },
        title: "Deckard",
      })
    ).toBe("A slide from Deckard")
  })
})

describe("readFontSource", () => {
  it("reads the file a Google Fonts stylesheet points at", () => {
    expect(readFontSource(googleCss)).toBe(
      "https://fonts.gstatic.com/l/font?kit=abc&skey=def&v=v14"
    )
  })

  it("reads a quoted url and gives nothing for a stylesheet without one", () => {
    expect(readFontSource('src: url("https://x.test/a.ttf")')).toBe(
      "https://x.test/a.ttf"
    )
    expect(readFontSource("/* no fonts */")).toBeUndefined()
  })
})

describe("googleFontCssUrl", () => {
  it("asks for one weight of the family, subset to the text", () => {
    expect(googleFontCssUrl("Source Serif 4", 600, "Hi & 1/2")).toBe(
      "https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@600&text=Hi%20%26%201%2F2"
    )
  })
})

describe("loadCardFont", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("fetches the stylesheet, then the file it names", async () => {
    const bytes = new Uint8Array([0, 1, 0, 0]).buffer
    const fetcher = vi.fn(async (url: string) =>
      url.startsWith("https://fonts.googleapis.com/")
        ? new Response(googleCss)
        : new Response(bytes)
    )

    const face = await loadCardFont("Source Serif 4", 600, "abc", fetcher)

    expect(face).toMatchObject({ name: "Source Serif 4", weight: 600 })
    expect(new Uint8Array(face?.data ?? new ArrayBuffer(0))).toEqual(
      new Uint8Array(bytes)
    )
    expect(fetcher).toHaveBeenCalledTimes(2)

    await loadCardFont("Source Serif 4", 600, "abc", fetcher)

    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it("warns once and gives nothing when the family does not load", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const fetcher = vi.fn(async () => new Response("", { status: 400 }))

    await expect(
      loadCardFont("Not A Family", 700, "abc", fetcher)
    ).resolves.toBeUndefined()
    await expect(
      loadCardFont("Not A Family", 700, "abcd", fetcher)
    ).resolves.toBeUndefined()

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('"Not A Family" 700')
  })

  it("survives a fetch that throws, as an offline build does", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const fetcher = vi.fn(() => Promise.reject(new TypeError("fetch failed")))

    await expect(
      loadCardFont("Offline Family", 400, "abc", fetcher)
    ).resolves.toBeUndefined()
  })
})

describe("createSlideShareCard", () => {
  const card = createSlideShareCard(deck)

  it("lists every slide, so each card prerenders", () => {
    expect(card.generateStaticParams()).toEqual([
      { id: "opening" },
      { id: "numbers" },
    ])
  })

  it("describes the card for Open Graph", () => {
    expect(card).toMatchObject({
      alt: "A slide from What we shipped by Acme",
      contentType: "image/png",
      size: { height: 630, width: 1200 },
    })
  })

  it("renders a PNG for a slide and a 404 for anything else", async () => {
    const image = await card.Image({
      params: Promise.resolve({ id: "opening" }),
    })
    const bytes = new Uint8Array(await image.arrayBuffer())

    expect(image.headers.get("content-type")).toBe("image/png")
    expect([...bytes.slice(1, 4)]).toEqual([0x50, 0x4e, 0x47])

    const missing = await card.Image({
      params: Promise.resolve({ id: "missing" }),
    })

    expect(missing.status).toBe(404)
  })
})
