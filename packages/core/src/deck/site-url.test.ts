import { afterEach, describe, expect, it, vi } from "vitest"
import { deckSiteUrl } from "./site-url"

afterEach(() => {
  vi.unstubAllEnvs()
})

function stubEnv(values: Record<string, string | undefined>) {
  for (const name of [
    "NEXT_PUBLIC_SITE_URL",
    "VERCEL_BRANCH_URL",
    "VERCEL_ENV",
    "VERCEL_PROJECT_PRODUCTION_URL",
    "VERCEL_URL",
  ]) {
    vi.stubEnv(name, values[name])
  }
}

describe("deckSiteUrl", () => {
  it("prefers the URL a caller passes", () => {
    stubEnv({ NEXT_PUBLIC_SITE_URL: "https://talk.example.com" })

    expect(deckSiteUrl("https://other.example.com")).toBe(
      "https://other.example.com"
    )
  })

  it("reads NEXT_PUBLIC_SITE_URL before anything Vercel sets", () => {
    stubEnv({
      NEXT_PUBLIC_SITE_URL: "https://talk.example.com",
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "talk.vercel.app",
    })

    expect(deckSiteUrl()).toBe("https://talk.example.com")
  })

  it("uses the production domain on a Vercel production build", () => {
    stubEnv({
      VERCEL_BRANCH_URL: "talk-git-main.vercel.app",
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "talk.vercel.app",
    })

    expect(deckSiteUrl()).toBe("https://talk.vercel.app")
  })

  it("uses the branch alias on a Vercel preview build", () => {
    stubEnv({
      VERCEL_BRANCH_URL: "talk-git-draft.vercel.app",
      VERCEL_ENV: "preview",
      VERCEL_PROJECT_PRODUCTION_URL: "talk.vercel.app",
      VERCEL_URL: "talk-abc123.vercel.app",
    })

    expect(deckSiteUrl()).toBe("https://talk-git-draft.vercel.app")
  })

  it("falls back to localhost with nothing set", () => {
    stubEnv({})

    expect(deckSiteUrl()).toBe("http://localhost:3000")
  })
})
