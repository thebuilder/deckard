import type { PreviewSlide } from "./deck-preview"

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
 * the page tags every line with its number, and the script lights the range.
 * Editing the sample means re-counting these four pairs.
 */
export const demoSteps: DemoStep[] = [
  {
    from: 11,
    label: "The opener",
    slide: demoOpener,
    summary:
      "A slide is an object with a title and a body. The heading on the canvas is the slide's own title, read from context, so the block takes no title prop.",
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
    summary:
      "Blocks go inside the body. StatGrid sets the figure size and the rule above it, and the theme sets everything else. notes is speaker-only and never renders.",
    to: 24,
  },
  {
    from: 25,
    label: "The list",
    slide: {
      brand,
      bullets: [
        "Stop maintaining a template and make the framework the template.",
        "Fix the canvas at 1920 by 1080 and give up responsive layout inside a slide.",
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
    summary:
      "The same shell with a different block in it. Only the body changed.",
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
    summary:
      "background names which of the theme's four backdrops the canvas paints behind the slide. This one is spotlight.",
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

export const serverSlideCode = `import { StatGrid } from "@/app/slides/blocks/metrics"
import { OpenContentSlide } from "@/app/slides/blocks/templates"

export default async function VitalsSlide() {
  const vitals = await readDeployLog()

  return (
    <OpenContentSlide
      description="Read at build time, so the HTML ships with the answer in it."
      eyebrow="Live"
      title="Numbers from the build we are standing in"
    >
      <StatGrid items={vitals} />
    </OpenContentSlide>
  )
}`

export const notesCode = `{
  title: "What it costs",
  notes: "They ask about the enterprise tier. Say 'call us'.",
  stepCount: 3,
  body: <PricingSlide />,
}`

export const cliCode = `deckard init my-talk --theme phosphor
deckard validate          # the deck resolves, the theme is coherent
deckard check-overflow    # fails, listing the slides the canvas clips
deckard contact-sheet     # every slide in one grid image
deckard export pdf        # one page per slide at 1440x810pt`
