import { defineComponents } from "blume"
import DeckPreview from "./components/DeckPreview.astro"
import Logo from "./components/Logo.astro"
import ThemeGallery from "./components/ThemeGallery.astro"
import ThemePalette from "./components/ThemePalette.astro"

export default defineComponents({
  layout: {
    Logo,
  },
  mdx: {
    DeckPreview,
    ThemeGallery,
    ThemePalette,
  },
})
