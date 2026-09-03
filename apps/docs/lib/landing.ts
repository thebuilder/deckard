import { resolveCanvas } from "@deckard/core"
import type { PreviewSlide } from "./deck-preview"

/* The canvas a deck renders at, read from the runtime rather than typed here,
 * so the copy and the previews move together if the default ever changes. */
export const canvas = resolveCanvas()

const brand = "Acme"
const meta = "March 2026"
const total = 18

export const heroSlide: PreviewSlide = {
  brand,
  eyebrow: "Engineering all-hands",
  heading: "What we shipped in Q1",
  layout: "hero",
  lead: "Forty minutes, eighteen slides, and one number that will start an argument.",
  meta,
  number: 1,
  title: "What we shipped in Q1",
  total,
}

const demoOpener: PreviewSlide = {
  brand,
  eyebrow: "Engineering all-hands",
  heading: "What we shipped in Q1",
  layout: "hero",
  meta,
  number: 1,
  title: "What we shipped in Q1",
  total,
}

export interface DemoStep {
  from: number
  label: string
  slide: PreviewSlide
  summary: string
  to: number
}

/*
 * from and to are 1-based line numbers into demoCode. The shiki transformer in
 * the page tags every line with its number, and the rules the page generates
 * light the range.
 * Editing the sample means re-counting these four pairs.
 */
export const demoSteps: DemoStep[] = [
  {
    from: 11,
    label: "The opener",
    slide: demoOpener,
    summary: "A hero layout: an eyebrow, the title, and one line under it.",
    to: 15,
  },
  {
    from: 16,
    label: "The numbers",
    slide: {
      brand,
      eyebrow: "Quarter in review",
      figures: [
        { caption: "Median deck build, down from 41 seconds", value: "6.2s" },
        {
          caption: "Slides that needed a fix after export",
          unit: "%",
          value: "0",
        },
        { caption: "Talks rebuilt on the new deck this quarter", value: "31" },
      ],
      heading: "The three numbers that moved",
      layout: "figures",
      meta,
      number: 2,
      title: "The three numbers that moved",
      total,
    },
    summary: "A stat grid of three figures. The notes stay off the canvas.",
    to: 24,
  },
  {
    from: 25,
    label: "The list",
    slide: {
      brand,
      bullets: [
        "Stop maintaining a template and make the framework the template.",
        "Fix the canvas and give up responsive layout inside a slide.",
        "Put every color and size behind a token, so a theme is one import.",
      ],
      eyebrow: "The work",
      heading: "How we got there",
      layout: "bullets",
      meta,
      number: 3,
      title: "How we got there",
      total,
    },
    summary: "The same slide with a bullet list in it instead.",
    to: 32,
  },
  {
    from: 33,
    label: "The breaker",
    slide: {
      brand,
      eyebrow: "The trade",
      heading: "The bill for all of it",
      layout: "breaker",
      lead: "Two engineers, six weeks, and a migration we are still paying interest on.",
      meta,
      number: 4,
      title: "The bill for all of it",
      total,
    },
    summary: "A section break, painted on the theme's spotlight backdrop.",
    to: 39,
  },
]

export const demoBackgrounds = [
  "default",
  "default",
  "default",
  "spotlight",
] as const

export const demoCode = `import type { SlideDefinition } from "@deckard/core"
import { BulletList } from "@/app/slides/blocks/collections"
import { StatGrid } from "@/app/slides/blocks/metrics"
import {
  BreakerSlide,
  HeroSlide,
  OpenContentSlide,
} from "@/app/slides/blocks/templates"

export const slides: SlideDefinition[] = [
  {
    slug: "intro",
    title: "What we shipped in Q1",
    body: <HeroSlide eyebrow="Engineering all-hands" />,
  },
  {
    title: "The three numbers that moved",
    notes: "Pause on the middle figure. They ask about that one.",
    body: (
      <OpenContentSlide eyebrow="Quarter in review">
        <StatGrid items={quarterly} />
      </OpenContentSlide>
    ),
  },
  {
    title: "How we got there",
    body: (
      <OpenContentSlide eyebrow="The work">
        <BulletList items={decisions} />
      </OpenContentSlide>
    ),
  },
  {
    title: "The bill for all of it",
    background: "spotlight",
    body: (
      <BreakerSlide description={theBill} eyebrow="The trade" />
    ),
  },
]`

/*
 * The two ways in, shown as a toggle under the hero. The first is the command
 * the quickstart walks through. The second is the same start phrased for a
 * coding agent: one line to paste that names the outcome and the command.
 */
export const installCode = {
  agent:
    "Set up a new Deckard presentation in ./my-talk with npx @deckard/cli init",
  terminal: "npx @deckard/cli init my-talk",
} as const

export const cliCode = `deckard check-overflow    # fails, naming the slides the canvas clips
deckard contact-sheet     # every slide in one grid image
deckard export pdf        # one page per slide`
