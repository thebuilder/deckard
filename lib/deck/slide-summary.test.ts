import { describe, expect, it } from "vitest"

import { resolveSlides } from "@/lib/deck/resolve-slides"
import { toSlideSummaries, toSlideSummary } from "@/lib/deck/slide-summary"

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
      href: "/slides/intro",
      id: "intro",
      number: 1,
      stepCount: 3,
      title: "Deckard",
    })
  })

  it("summarizes a whole deck in order", () => {
    const summaries = toSlideSummaries(
      resolveSlides([{ body: null }, { body: null, slug: "pricing" }])
    )

    expect(summaries.map((summary) => summary.id)).toEqual(["1", "pricing"])
    expect(summaries.map((summary) => summary.number)).toEqual([1, 2])
  })
})
