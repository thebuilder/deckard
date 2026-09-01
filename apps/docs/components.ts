import { defineComponents } from "blume"
import Logo from "./components/Logo.astro"
import ThemePalette from "./components/ThemePalette.astro"

export default defineComponents({
  layout: {
    Logo,
  },
  mdx: {
    ThemePalette,
  },
})
