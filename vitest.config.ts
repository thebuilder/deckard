import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    projects: [
      {
        resolve: { tsconfigPaths: true },
        test: {
          environment: "node",
          include: ["lib/**/*.test.ts", "deck/**/*.test.ts"],
          name: "node",
        },
      },
      {
        resolve: { tsconfigPaths: true },
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
          include: ["**/*.browser.test.tsx"],
          name: "browser",
        },
      },
    ],
  },
})
