import { describe, expect, it } from "vitest"

import { getSlideById, resolveSlides } from "@/lib/deck/resolve-slides"
import type { SlideDefinition } from "@/lib/deck/types"

function slide(meta: Partial<SlideDefinition> = {}): SlideDefinition {
  return { body: null, ...meta }
}

describe("resolveSlides ids", () => {
  it("numbers slides without a slug by position", () => {
    const resolved = resolveSlides([slide(), slide(), slide()])

    expect(resolved.map((item) => item.id)).toEqual(["1", "2", "3"])
    expect(resolved.map((item) => item.number)).toEqual([1, 2, 3])
    expect(resolved.map((item) => item.index)).toEqual([0, 1, 2])
  })

  it("keeps an explicit slug as the id and leaves neighbours numbered", () => {
    const resolved = resolveSlides([
      slide(),
      slide({ slug: "pricing" }),
      slide(),
    ])

    expect(resolved.map((item) => item.id)).toEqual(["1", "pricing", "3"])
    expect(resolved[1].slug).toBe("pricing")
    expect(resolved[0].slug).toBeUndefined()
  })

  it("builds hrefs from the resolved id", () => {
    const resolved = resolveSlides([slide({ slug: "intro" }), slide()])

    expect(resolved.map((item) => item.href)).toEqual([
      "/slides/intro",
      "/slides/2",
    ])
  })

  it("does not derive a slug from the title", () => {
    const resolved = resolveSlides([slide({ title: "Layout and Background" })])

    expect(resolved[0].id).toBe("1")
  })

  it("keeps the authored array order", () => {
    const resolved = resolveSlides([
      slide({ title: "third" }),
      slide({ title: "first" }),
      slide({ title: "fourth" }),
    ])

    expect(resolved.map((item) => item.title)).toEqual([
      "third",
      "first",
      "fourth",
    ])
    expect(resolved.map((item) => item.id)).toEqual(["1", "2", "3"])
  })
})

describe("resolveSlides defaults", () => {
  it("falls back to a numbered title", () => {
    const resolved = resolveSlides([slide(), slide({ title: "Named" })])

    expect(resolved.map((item) => item.title)).toEqual(["Slide 1", "Named"])
  })

  it("applies deck defaults and a zero step count", () => {
    const resolved = resolveSlides(
      [slide(), slide({ background: "grid", stepCount: 3 })],
      { footer: "counter", header: "auto" }
    )

    expect(resolved[0]).toMatchObject({
      background: "default",
      footer: "counter",
      header: "auto",
      layout: "default",
      stepCount: 0,
    })
    expect(resolved[1]).toMatchObject({ background: "grid", stepCount: 3 })
  })
})

describe("resolveSlides validation", () => {
  it("rejects duplicate explicit slugs", () => {
    expect(() =>
      resolveSlides([slide({ slug: "intro" }), slide({ slug: "intro" })])
    ).toThrow('both use the slug "intro"')
  })

  it("rejects a fully numeric slug", () => {
    expect(() => resolveSlides([slide(), slide({ slug: "1" })])).toThrow(
      'numeric slug "1"'
    )
    expect(() => resolveSlides([slide({ slug: "2" }), slide()])).toThrow(
      'numeric slug "2"'
    )
    expect(() => resolveSlides([slide({ slug: "007" })])).toThrow(
      'numeric slug "007"'
    )
  })

  it("allows a slug that only starts with digits", () => {
    const resolved = resolveSlides([slide({ slug: "2024-recap" })])

    expect(resolved[0].id).toBe("2024-recap")
  })

  it("rejects an empty slug", () => {
    expect(() => resolveSlides([slide({ slug: "" })])).toThrow("empty slug")
  })

  it("rejects slugs with characters unsafe in a URL path", () => {
    expect(() => resolveSlides([slide({ slug: "Intro Slide" })])).toThrow(
      "not safe in a URL"
    )
    expect(() => resolveSlides([slide({ slug: "intro/deep" })])).toThrow(
      "not safe in a URL"
    )
    expect(() => resolveSlides([slide({ slug: "café" })])).toThrow(
      "not safe in a URL"
    )
  })
})

describe("getSlideById", () => {
  const resolved = resolveSlides([slide(), slide({ slug: "pricing" }), slide()])

  it("finds a numbered slide by its numeric id", () => {
    expect(getSlideById(resolved, "1")?.number).toBe(1)
  })

  it("finds a slugged slide by its slug", () => {
    expect(getSlideById(resolved, "pricing")?.number).toBe(2)
  })

  it("does not find a slugged slide by its number", () => {
    expect(getSlideById(resolved, "2")).toBeUndefined()
  })

  it("returns undefined for an unknown id", () => {
    expect(getSlideById(resolved, "missing")).toBeUndefined()
    expect(getSlideById(resolved, "99")).toBeUndefined()
  })
})
