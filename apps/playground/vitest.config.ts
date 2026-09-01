import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vitest/config"

// The block tests mount one component with no Next app around it, so the two
// Next client modules resolve to fixtures, the way @deckard/core does it.
const nextClientStubs = {
  "next/link": new URL("./tests/__fixtures__/next-link.tsx", import.meta.url)
    .pathname,
  "next/navigation": new URL(
    "./tests/__fixtures__/next-navigation.ts",
    import.meta.url
  ).pathname,
}

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          environment: "node",
          include: ["deck/**/*.test.ts"],
          name: "playground",
        },
      },
      {
        resolve: {
          alias: {
            ...nextClientStubs,
            "@": new URL(".", import.meta.url).pathname,
          },
        },
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: "chromium" }],
            provider: playwright(),
          },
          include: ["tests/**/*.browser.test.tsx"],
          name: "blocks",
        },
      },
    ],
  },
})
