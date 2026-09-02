import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import type { SlideMeta } from "@deckard/core"
import { StatGrid } from "@/app/slides/blocks/metrics"
import { OpenContentSlide } from "@/app/slides/blocks/templates"

export const meta: SlideMeta = {
  order: 30,
  slug: "numbers",
  title: "Numbers",
}

export const notes = `Three figures, and every one of them says what it is measured against. A number on a slide with no comparison is decoration.

The meter under the first figure is a proportion, and the caption says what of. Say it out loud, or drop the meter.

Nothing on this slide is typed. The deck counts its own routes, the delay is the constant the server slide awaits, and the block families are the files in app/slides/blocks. A figure that repeats a number from somewhere else is wrong the week after you write it.

The block only sets the rule, the figure size, the meter, and the caption size. Everything else is the theme, which is why this slide looks like newsprint under broadsheet and like a console under nexus.`

/*
 * The families a deck composes from, counted where they live. Read off disk
 * rather than globbed: every slide route prerenders, so this runs during the
 * build, in the deck directory, and reaches no bundler.
 */
function countBlockFamilies() {
  return fs
    .readdirSync(path.join(process.cwd(), "app/slides/blocks"))
    .filter((entry) => entry.endsWith(".tsx")).length
}

export default async function NumbersSlide() {
  /*
   * Loaded here rather than imported at the top: deck/slides.tsx globs this
   * file, so a static import back to it would be a cycle. By the time a slide
   * renders, the array it belongs to is built.
   */
  const { slides, vitalsDelayMs } = await import("@/deck/slides")
  const inOwnFile = slides.filter((slide) => slide.sourcePath).length
  const blockFamilies = countBlockFamilies()

  return (
    <OpenContentSlide
      description="Two to four columns, each with an optional unit and meter."
      eyebrow="Metrics"
      title="Three figures, each with its comparison"
    >
      <StatGrid
        items={[
          {
            caption: "Slide routes, the meter their share written as modules",
            meter: inOwnFile / slides.length,
            value: String(slides.length),
          },
          {
            caption: "Awaited on the server before any HTML was sent",
            unit: "ms",
            value: String(vitalsDelayMs),
          },
          {
            caption: "Block families in app/slides/blocks, yours to edit",
            value: String(blockFamilies),
          },
        ]}
      />
    </OpenContentSlide>
  )
}
