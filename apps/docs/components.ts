import { defineComponents } from "blume"
import DeckPreview from "./components/DeckPreview.astro"
import ExampleDeck from "./components/ExampleDeck.astro"
import SlidePatterns from "./components/SlidePatterns.astro"
import SlideTokens from "./components/SlideTokens.astro"
import ThemeGallery from "./components/ThemeGallery.astro"
import ThemePalette from "./components/ThemePalette.astro"
import ThemeStrip from "./components/ThemeStrip.astro"
import ThemeTable from "./components/ThemeTable.astro"

export default defineComponents({
  mdx: {
    DeckPreview,
    ExampleDeck,
    SlidePatterns,
    SlideTokens,
    ThemeGallery,
    ThemePalette,
    ThemeStrip,
    ThemeTable,
  },
})
