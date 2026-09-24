import { afterEach, describe, expect, it, vi } from "vitest"
import { defineDeck } from "../deck/define-deck"
import {
  createDeckSitemap,
  createPresenterPage,
  createSlideRoute,
  createSlideShareCard,
} from "./routes"

const deck = defineDeck({
  description: "A route test deck",
  footer: { mode: "visible" },
  header: { brand: "Test", href: "/", mode: "auto" },
  routes: { presenter: false, slides: "/example" },
  slides: [{ body: null, slug: "opening", title: "Opening" }],
  title: "Test deck",
})

describe("createSlideRoute", () => {
  it("forwards the deck routes to the slide shell", async () => {
    const { Page } = createSlideRoute(deck)
    const element = await Page({ params: Promise.resolve({ id: "opening" }) })

    expect(element.props.deck.presenterHref).toBeUndefined()
    expect(element.props.slide.href).toBe("/example/opening")
  })

  it("forwards the slide route to presenter previews", () => {
    const { Page } = createPresenterPage(deck)

    expect(Page().props.slidesPath).toBe("/example")
  })
})

describe("site URL", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("resolves slide metadata against the same origin as the sitemap", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://deck.example.com")

    const { generateMetadata } = createSlideRoute(deck)
    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "opening" }),
    })

    expect(metadata.metadataBase?.toString()).toBe("https://deck.example.com/")
    expect(createDeckSitemap(deck)()[1].url).toBe(
      "https://deck.example.com/example/opening"
    )
  })

  it("falls back to localhost for both", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined)

    const { generateMetadata } = createSlideRoute(deck)
    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "opening" }),
    })

    expect(metadata.metadataBase?.toString()).toBe("http://localhost:3000/")
  })
})

describe("createSlideShareCard", () => {
  const card = createSlideShareCard(deck)

  it("lists every slide, so each card prerenders", () => {
    expect(card.generateStaticParams()).toEqual([{ id: "opening" }])
  })

  it("describes the card for Open Graph", () => {
    expect(card).toMatchObject({
      alt: "A slide from Test deck by Test",
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
