import { isPdfExport } from "./pdf-export"

/**
 * The marker a capture tool puts on the document before the deck loads.
 *
 * `deckard export pdf` builds its own profile and answers through
 * `isPdfExport`. `deckard screenshots`, `deckard contact-sheet`, and
 * `deckard check-overflow` drive the ordinary preview build, so the harness
 * marks the page instead of rebuilding the deck to say the same thing.
 */
export const captureAttribute = "data-deck-capture"

// The PDF flag is a build-time environment read. Next inlines it into the
// client bundle; anything else that renders these components leaves `process`
// undefined, and a flag nothing set is not a capture.
function isPdfExportBuild(): boolean {
  return typeof process !== "undefined" && isPdfExport()
}

/** True while the page is being photographed or measured rather than presented. */
export function isCapturing(): boolean {
  if (isPdfExportBuild()) {
    return true
  }

  return (
    typeof document !== "undefined" &&
    document.documentElement.hasAttribute(captureAttribute)
  )
}
