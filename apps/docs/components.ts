import { defineComponents } from "blume"
import DeckPreview from "./components/DeckPreview.astro"
import ThemeGallery from "./components/ThemeGallery.astro"
import ThemePalette from "./components/ThemePalette.astro"
import ThemeStrip from "./components/ThemeStrip.astro"

export default defineComponents({
  mdx: {
    DeckPreview,
    ThemeGallery,
    ThemePalette,
    ThemeStrip,
  },
})
