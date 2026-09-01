import { describe, expect, it } from "vitest"

import { meetsMinimum } from "./doctor.ts"

describe("meetsMinimum", () => {
  it("compares the whole version, not the major", () => {
    expect(meetsMinimum("20.9.0", "20.9.0")).toBe(true)
    expect(meetsMinimum("20.8.1", "20.9.0")).toBe(false)
    expect(meetsMinimum("20.19.4", "20.9.0")).toBe(true)
    expect(meetsMinimum("24.14.0", "20.9.0")).toBe(true)
    expect(meetsMinimum("18.20.4", "20.9.0")).toBe(false)
  })
})
