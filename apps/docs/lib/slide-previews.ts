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
