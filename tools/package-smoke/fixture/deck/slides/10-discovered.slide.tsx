import type { SlideMeta } from "@deckard/core"

export const meta: SlideMeta = {
  order: 10,
  slug: "discovered",
  title: "Discovered",
}

export const notes = "Found by the glob, not imported by hand."

export default function DiscoveredSlide() {
  return (
    <p className="text-[length:var(--slide-lead-size)] text-muted-foreground">
      This module was discovered by the glob.
    </p>
  )
}
