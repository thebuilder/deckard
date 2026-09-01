import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: ["deck/**/*.test.ts", "scripts/**/*.test.ts"],
    name: "playground",
  },
})
