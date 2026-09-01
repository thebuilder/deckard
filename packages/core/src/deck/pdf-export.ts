import type { SlideColorMode } from "./types"

// Both flags are build-time and public, so Next inlines them into the client
// bundle and the deck app never reads the request to answer either question.
export function isPdfExport(): boolean {
  return process.env.NEXT_PUBLIC_PDF_EXPORT === "1"
}

// A PDF page is one color mode, decided by the build. The provider has to force
// it: a theme that defaults to dark answers a light export in dark otherwise,
// because next-themes prefers its own default over the operating system.
export function pdfExportColorMode(): SlideColorMode | undefined {
  if (!isPdfExport()) {
    return undefined
  }

  const mode = process.env.NEXT_PUBLIC_PDF_THEME

  return mode === "dark" || mode === "light" ? mode : undefined
}
