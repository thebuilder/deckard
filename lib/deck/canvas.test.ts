import { describe, expect, it } from "vitest"

import { resolveCanvas } from "@/lib/deck/canvas"

describe("resolveCanvas", () => {
  it("defaults to a 1920x1080 contained canvas", () => {
    expect(resolveCanvas()).toEqual({
      fit: "contain",
      height: 1080,
      margin: 24,
      mode: "fixed",
      width: 1920,
    })
  })

  it("keeps the defaults a deck does not override", () => {
    expect(resolveCanvas({ margin: 0, width: 1280 })).toEqual({
      fit: "contain",
      height: 1080,
      margin: 0,
      mode: "fixed",
      width: 1280,
    })
  })

  it("rejects a canvas side that cannot be laid out", () => {
    expect(() => resolveCanvas({ width: 0 })).toThrow(/width/)
    expect(() => resolveCanvas({ height: Number.NaN })).toThrow(/height/)
  })

  it("rejects a negative margin", () => {
    expect(() => resolveCanvas({ margin: -1 })).toThrow(/margin/)
  })
})
