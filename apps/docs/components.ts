import { defineComponents } from "blume"
import DeckPreview from "./components/DeckPreview.astro"
import SlideTokens from "./components/SlideTokens.astro"
import ThemeGallery from "./components/ThemeGallery.astro"
import ThemePalette from "./components/ThemePalette.astro"
import ThemeStrip from "./components/ThemeStrip.astro"
import ThemeTable from "./components/ThemeTable.astro"

export default defineComponents({
  mdx: {
    DeckPreview,
    SlideTokens,
    ThemeGallery,
    ThemePalette,
    ThemeStrip,
    ThemeTable,
  },
})
