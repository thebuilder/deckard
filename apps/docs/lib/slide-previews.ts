export const slidePreviewRoutes = [
  "/example/opening",
  "/example/agenda",
  "/example/figures",
  "/example/decision",
  "/example/field-notes",
  "/example/roadmap",
  "/example/review",
  "/example/close",
  "/slides/intro",
  "/slides/canvas",
  "/slides/presenter",
  "/slides/numbers",
  "/slides/content-card",
  "/slides/one-surface",
  "/slides/roadmap",
  "/slides/quote",
  "/slides/image",
] as const

export type SlidePreviewRoute = (typeof slidePreviewRoutes)[number]

export function slidePreviewPath(route: SlidePreviewRoute) {
  return `/previews${route}.jpg`
}

/*
 * The example deck photographed under every built-in, in each color mode the
 * theme carries. The theme gallery and the landing page read these, and
 * `pnpm --filter playground docs:previews` writes them.
 */
export const themePreviewSlides = [
  "opening",
  "figures",
  "decision",
  "close",
] as const

export type ThemePreviewSlide = (typeof themePreviewSlides)[number]

export type PreviewColorMode = "dark" | "light"

export function themePreviewPath(
  theme: string,
  slide: ThemePreviewSlide,
  mode: PreviewColorMode
) {
  return `/previews/themes/${theme}/${slide}-${mode}.jpg`
}
