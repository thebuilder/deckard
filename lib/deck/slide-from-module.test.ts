import { isValidElement } from "react"
import { describe, expect, it } from "vitest"

import { resolveSlides } from "@/lib/deck/resolve-slides"
import { slideFromModule } from "@/lib/deck/slide-from-module"
import type { SlideModule } from "@/lib/deck/types"

function moduleWith(overrides: Partial<SlideModule> = {}): SlideModule {
  return { default: () => null, ...overrides }
}

describe("slideFromModule", () => {
  it("renders the default export as the slide body", () => {
    const slideModule = moduleWith()
    const { body } = slideFromModule(slideModule)

    expect(isValidElement(body)).toBe(true)
    expect(isValidElement(body) ? body.type : null).toBe(slideModule.default)
  })

  it("spreads meta onto the definition", () => {
    const definition = slideFromModule(
      moduleWith({
        meta: {
          background: "grid",
          layout: "fullscreen",
          slug: "demo",
          stepCount: 2,
          title: "Demo",
        },
      })
    )

    expect(definition).toMatchObject({
      background: "grid",
      layout: "fullscreen",
      slug: "demo",
      stepCount: 2,
      title: "Demo",
    })
  })

  it("prefers the module notes export over meta notes", () => {
    const definition = slideFromModule(
      moduleWith({ meta: { notes: "from meta" }, notes: "from export" })
    )

    expect(definition.notes).toBe("from export")
  })

  it("falls back to meta notes when the module exports none", () => {
    const definition = slideFromModule(moduleWith({ meta: { notes: "only" } }))

    expect(definition.notes).toBe("only")
  })

  it("passes the source path through to the resolved slide", () => {
    const resolved = resolveSlides([
      slideFromModule(moduleWith(), "deck/slides/demo.slide.tsx"),
    ])

    expect(resolved[0].sourcePath).toBe("deck/slides/demo.slide.tsx")
  })

  it("keeps an async component as the body type", () => {
    const slideModule = moduleWith({
      default: () => Promise.resolve(null),
    })

    expect(isValidElement(slideFromModule(slideModule).body)).toBe(true)
  })
})
