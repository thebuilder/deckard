import { describe, expect, it } from "vitest"

import { discoverSlides, type SlideSort } from "./discovery"
import { resolveSlides } from "./resolve-slides"
import type { SlideMeta, SlideModule } from "./types"

type GlobEntry = [string, SlideMeta?]

const brokenPathPattern = /slides\/broken\.slide\.tsx/
const missingDefaultPattern = /no default export/
const asyncModulePattern = /async module/

function slideModule(meta?: SlideMeta): SlideModule {
  return { default: () => null, meta }
}

function globOf(entries: GlobEntry[]) {
  return Object.fromEntries(
    entries.map(([path, meta]) => [path, slideModule(meta)])
  )
}

function pathsOf(entries: GlobEntry[], sort?: SlideSort) {
  return discoverSlides(globOf(entries), { sort }).map(
    (slide) => slide.sourcePath
  )
}

describe("discoverSlides sorting", () => {
  it("sorts numeric filename prefixes naturally", () => {
    const paths = pathsOf([
      ["./slides/10-outro.slide.tsx"],
      ["./slides/2-intro.slide.tsx"],
      ["./slides/1-cover.slide.tsx"],
    ])

    expect(paths).toEqual([
      "slides/1-cover.slide.tsx",
      "slides/2-intro.slide.tsx",
      "slides/10-outro.slide.tsx",
    ])
  })

  it("sorts nested directories segment by segment", () => {
    const paths = pathsOf([
      ["./slides/20-solution/10-a.slide.tsx"],
      ["./slides/10-context.slide.tsx"],
      ["./slides/10-context/20-b.slide.tsx"],
      ["./slides/10-context/10-a.slide.tsx"],
    ])

    expect(paths).toEqual([
      "slides/10-context/10-a.slide.tsx",
      "slides/10-context/20-b.slide.tsx",
      "slides/10-context.slide.tsx",
      "slides/20-solution/10-a.slide.tsx",
    ])
  })

  it("ignores the enumeration order of the glob object", () => {
    const paths = pathsOf([
      ["./slides/c.slide.tsx"],
      ["./slides/b.slide.tsx"],
      ["./slides/a.slide.tsx"],
    ])

    expect(paths).toEqual([
      "slides/a.slide.tsx",
      "slides/b.slide.tsx",
      "slides/c.slide.tsx",
    ])
  })

  it("sorts by meta.order and falls back to path order", () => {
    const paths = pathsOf(
      [
        ["./slides/10-second.slide.tsx", { order: 2 }],
        ["./slides/20-first.slide.tsx", { order: 1 }],
        ["./slides/2-unordered.slide.tsx"],
        ["./slides/1-tied.slide.tsx", { order: 2 }],
      ],
      "order"
    )

    expect(paths).toEqual([
      "slides/20-first.slide.tsx",
      "slides/1-tied.slide.tsx",
      "slides/10-second.slide.tsx",
      "slides/2-unordered.slide.tsx",
    ])
  })

  it("uses a custom comparator as given", () => {
    const byTitle: SlideSort = (left, right) =>
      (left.meta.title ?? "").localeCompare(right.meta.title ?? "")

    const paths = pathsOf(
      [
        ["./slides/1-a.slide.tsx", { title: "Zebra" }],
        ["./slides/2-b.slide.tsx", { title: "Antelope" }],
      ],
      byTitle
    )

    expect(paths).toEqual(["slides/2-b.slide.tsx", "slides/1-a.slide.tsx"])
  })
})

describe("discoverSlides definitions", () => {
  it("captures the normalized glob key as the source path", () => {
    const resolved = resolveSlides(
      discoverSlides(globOf([["./slides/pricing.slide.tsx"]]))
    )

    expect(resolved[0].sourcePath).toBe("slides/pricing.slide.tsx")
  })

  it("carries meta onto the definition without meta.order", () => {
    const [definition] = discoverSlides(
      globOf([["./slides/pricing.slide.tsx", { order: 3, title: "Pricing" }]]),
      { sort: "order" }
    )

    expect(definition.title).toBe("Pricing")
    expect(Object.hasOwn(definition, "order")).toBe(false)
  })

  it("keeps discovered slides where the array spreads them", () => {
    const discovered = discoverSlides(
      globOf([["./slides/late.slide.tsx", { order: 1, title: "Late" }]]),
      { sort: "order" }
    )

    const resolved = resolveSlides([
      { body: null, title: "Cover" },
      ...discovered,
      { body: null, title: "Closing" },
    ])

    expect(resolved.map((slide) => slide.title)).toEqual([
      "Cover",
      "Late",
      "Closing",
    ])
  })
})

describe("discoverSlides validation", () => {
  it("names the file when a module has no default export", () => {
    expect(() =>
      discoverSlides({ "./slides/broken.slide.tsx": { meta: { title: "x" } } })
    ).toThrow(brokenPathPattern)
  })

  it("rejects a module that arrives as a promise", () => {
    expect(() =>
      discoverSlides({
        "./slides/highlighted.slide.tsx": Promise.resolve(slideModule()),
      })
    ).toThrow(asyncModulePattern)
  })

  it("rejects a glob entry that is not a module", () => {
    expect(() => discoverSlides({ "./slides/empty.slide.tsx": null })).toThrow(
      missingDefaultPattern
    )
  })
})
