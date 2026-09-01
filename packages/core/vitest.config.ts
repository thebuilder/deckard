import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vitest/config"

// The browser project mounts components on their own, with no Next app around
// them, so the two Next client modules resolve to fixtures instead.
const nextClientStubs = {
  "next/link": new URL(
    "./src/components/__fixtures__/next-link.tsx",
    import.meta.url
  ).pathname,
  "next/navigation": new URL(
    "./src/components/__fixtures__/next-navigation.ts",
    import.meta.url
  ).pathname,
}

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          environment: "node",
          include: ["src/**/*.test.ts"],
          name: "node",
        },
      },
      {
        resolve: {
          alias: nextClientStubs,
        },
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [
              { browser: "chromium" },
              { browser: "firefox" },
              { browser: "webkit" },
            ],
            provider: playwright(),
          },
          exclude: ["node_modules/**"],
          include: ["src/**/*.browser.test.tsx"],
          name: "browser",
        },
      },
    ],
  },
})
