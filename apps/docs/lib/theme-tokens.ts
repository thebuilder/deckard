import fs from "node:fs"
import path from "node:path"
import {
  type Palette,
  readThemePalettes,
} from "../../../packages/themes/scripts/theme-palette"
import { resolveRepoDirectory } from "./repo-file"

export const swatchTokens = [
  "background",
  "card",
  "muted",
  "border",
  "primary",
  "foreground",
] as const

export type SwatchToken = (typeof swatchTokens)[number]
export type Swatches = Palette<SwatchToken>

const themeSource = "packages/themes/src"
const themeDirectory = resolveRepoDirectory(themeSource)

if (themeDirectory === null) {
  console.warn(
    `[theme-tokens] No ${themeSource} directory above this build. The theme gallery will render empty swatches.`
  )
}

// A swatch is documentation, not the docs build. A stylesheet that moved or a
// token it never defines leaves that square blank instead of failing the build.
function readThemeCss(theme: string) {
  if (themeDirectory === null) {
    return ""
  }

  try {
    return fs.readFileSync(
      path.join(themeDirectory, theme, "theme.css"),
      "utf8"
    )
  } catch {
    return ""
  }
}

// The palette parser lives beside the themes, where the share card generator
// reads the same stylesheets with it.
export function readThemeSwatches(theme: string): {
  dark: Swatches
  light: Swatches
} {
  return readThemePalettes(readThemeCss(theme), theme, swatchTokens)
}
