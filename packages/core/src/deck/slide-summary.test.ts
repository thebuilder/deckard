import { describe, expect, it } from "vitest"

import { resolveSlides } from "./resolve-slides"
import {
  slideCountLabel,
  toSlideSummaries,
  toSlideSummary,
} from "./slide-summary"

describe("toSlideSummary", () => {
  it("keeps only the serializable fields the client needs", () => {
    const [resolved] = resolveSlides([
      {
        body: "not serializable across the boundary",
        notes: "private to the presenter",
        slug: "intro",
        stepCount: 3,
        title: "Deckard",
      },
    ])

    expect(toSlideSummary(resolved)).toEqual({
      authoredTitle: "Deckard",
      counted: true,
      countedNumber: 1,
      countedTotal: 1,
      href: "/slides/intro",
      id: "intro",
      number: 1,
      stepCount: 3,
      title: "Deckard",
    })
  })

  it("leaves the authored title off a slide that was never given one", () => {
    const [resolved] = resolveSlides([{ body: null }])

    expect(toSlideSummary(resolved).authoredTitle).toBeUndefined()
    expect(toSlideSummary(resolved).title).toBe("Slide 1")
  })

  it("summarizes a whole deck in order", () => {
    const summaries = toSlideSummaries(
      resolveSlides([{ body: null }, { body: null, slug: "pricing" }])
    )

    expect(summaries.map((summary) => summary.id)).toEqual(["1", "pricing"])
    expect(summaries.map((summary) => summary.number)).toEqual([1, 2])
  })
})

describe("slideCountLabel", () => {
  it("prints the counted number, padded when asked", () => {
    const [, second] = toSlideSummaries(
      resolveSlides([{ body: null, counted: false }, { body: null }])
    )

    expect(slideCountLabel(second)).toBe("1")
    expect(slideCountLabel(second, 2)).toBe("01")
  })

  it("prints no number for an uncounted slide", () => {
    const [first] = toSlideSummaries(
      resolveSlides([{ body: null, counted: false }])
    )

    expect(slideCountLabel(first)).toBe("·")
  })

  it("falls back to the position on a summary written by hand", () => {
    expect(slideCountLabel({ number: 4 }, 2)).toBe("04")
  })
})
