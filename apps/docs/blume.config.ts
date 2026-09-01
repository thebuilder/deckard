import { defineConfig } from "blume"

export default defineConfig({
  ai: {
    llmsTxt: true,
    openInChat: ["claude", "chatgpt", "cursor"],
  },
  description: "Beautiful React presentations with shadcn-native theming.",
  github: {
    branch: "main",
    dir: "apps/docs",
    owner: "thebuilder",
    repo: "deckard",
  },
  navigation: {
    sidebar: {
      display: "flat",
    },
  },
  search: {
    popular: [
      { href: "/quickstart", icon: "rocket", label: "Quickstart" },
      {
        href: "/guides/writing-slides",
        icon: "file-text",
        label: "Writing slides",
      },
      { href: "/guides/the-canvas", icon: "frame", label: "The canvas" },
      { href: "/reference/cli", icon: "terminal", label: "CLI reference" },
      { href: "/themes", icon: "palette", label: "Theme gallery" },
    ],
    provider: "orama",
  },
  theme: {
    accent: "teal",
    mode: "system",
    radius: "md",
  },
  title: "Deckard",
})
