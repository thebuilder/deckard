import { slides } from "@/deck/slides"
import { defineDeck } from "@/lib/deck/define-deck"

export const deck = defineDeck({
  description:
    "Reusable Next.js slideshow template with keyboard navigation, step reveals, configurable backgrounds, and image/fullscreen slide support.",
  footer: {
    mode: "counter",
  },
  header: {
    brand: "Slideshow Base",
    href: "/",
    mode: "auto",
  },
  slides,
  title: "Slideshow Base",
})
