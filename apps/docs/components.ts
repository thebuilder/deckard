import { defineComponents } from "blume"
import DeckPreview from "./components/DeckPreview.astro"
import Logo from "./components/Logo.astro"
import ThemeGallery from "./components/ThemeGallery.astro"
import ThemePalette from "./components/ThemePalette.astro"
import ThemeStrip from "./components/ThemeStrip.astro"

export default defineComponents({
  layout: {
    Logo,
  },
  mdx: {
    DeckPreview,
    ThemeGallery,
    ThemePalette,
    ThemeStrip,
  },
})
