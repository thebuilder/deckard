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

  it("orders slides by an explicit order before numbering", () => {
    const resolved = resolveSlides([
      slide({ title: "third" }),
      slide({ order: -1, title: "first" }),
      slide({ title: "fourth" }),
    ])

    expect(resolved.map((item) => item.title)).toEqual([
      "first",
      "third",
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

  it("rejects a slug that collides with a generated numeric id", () => {
    expect(() => resolveSlides([slide(), slide({ slug: "1" })])).toThrow(
      "already the generated id of slide 1"
    )
  })

  it("rejects a generated numeric id claimed by an earlier slug", () => {
    expect(() => resolveSlides([slide({ slug: "2" }), slide()])).toThrow(
      "already claimed by the slug on slide 1"
    )
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

  it("allows a numeric slug that matches the slide's own number", () => {
    const resolved = resolveSlides([slide(), slide({ slug: "2" })])

    expect(resolved.map((item) => item.id)).toEqual(["1", "2"])
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

  it("finds a slugged slide by its number", () => {
    expect(getSlideById(resolved, "2")?.slug).toBe("pricing")
  })

  it("returns undefined for an unknown id", () => {
    expect(getSlideById(resolved, "missing")).toBeUndefined()
    expect(getSlideById(resolved, "99")).toBeUndefined()
  })
})
