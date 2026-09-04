import { describe, expect, it } from "vitest"
import { defineDeck } from "../deck/define-deck"
import { createPresenterPage, createSlideRoute } from "./routes"

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
