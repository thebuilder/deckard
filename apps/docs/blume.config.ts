import { defineConfig } from "blume"

export default defineConfig({
  ai: {
    llmsTxt: true,
    openInChat: ["claude", "chatgpt", "cursor"],
  },
  deployment: {
    site: "https://deckard.thebuilder.dk",
  },
  description:
    "Presentations built out of React components: fixed layouts, speaker notes, themes, and PDF export.",
  github: {
    branch: "main",
    dir: "apps/docs",
    owner: "thebuilder",
    repo: "deckard",
  },
  logo: {
    image: "/icon.svg",
    text: "Deckard",
  },
  markdown: {
    codeBlocks: {
      theme: {
        dark: "github-dark-high-contrast",
        light: "github-light-high-contrast",
      },
    },
  },
  navigation: {
    sidebar: {
      display: "flat",
    },
    tabs: [
      { href: "/introduction", icon: "book-open", label: "Docs", path: "/" },
    ],
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
    fonts: {
      display: { name: "Orbitron", provider: "google", weights: [500, 700] },
    },
    mode: "system",
    radius: "md",
  },
  title: "Deckard",
})
