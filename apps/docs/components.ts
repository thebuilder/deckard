import { defineComponents } from "blume"
import ExampleDeck from "./components/ExampleDeck.astro"
import LiveDeck from "./components/LiveDeck.astro"
import SlidePatterns from "./components/SlidePatterns.astro"
import SlideTokens from "./components/SlideTokens.astro"
import ThemeGrid from "./components/ThemeGrid.astro"
import ThemePalette from "./components/ThemePalette.astro"
import ThemeShowcase from "./components/ThemeShowcase.astro"
import ThemeTable from "./components/ThemeTable.astro"

export default defineComponents({
  mdx: {
    ExampleDeck,
    LiveDeck,
    SlidePatterns,
    SlideTokens,
    ThemeGrid,
    ThemePalette,
    ThemeShowcase,
    ThemeTable,
  },
})
