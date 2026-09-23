import { resolveCanvas } from "@thebuilder/deckard-core"
import type { ThemePreviewSlide } from "./slide-previews"

/* The canvas a deck renders at, read from the runtime rather than typed here,
 * so the copy and the previews move together if the default ever changes. */
export const canvas = resolveCanvas()

export interface DemoStep {
  /* 1-based line numbers into demoCode, computed below. */
  from: number
  label: string
  slide: ThemePreviewSlide
  summary: string
  to: number
}

const head = `import type { SlideDefinition } from "@thebuilder/deckard-core"
import {
  BreakerSlide,
  CardGrid,
  HeroSlide,
  OpenContentSlide,
  StatGrid,
} from "@/app/slides/blocks"

export const slides: SlideDefinition[] = [`

/*
 * The example deck's own slides, trimmed to the props that show on the canvas.
 * Each entry is the code a step lights, and the picture beside it is that
 * slide captured from the playground.
 */
const entries: Array<Omit<DemoStep, "from" | "to"> & { code: string }> = [
  {
    code: `  {
    slug: "opening",
    title: "What we shipped in Q1",
    background: "hero",
    notes: "Name the outcome. Leave the how for later.",
    body: (
      <HeroSlide
        eyebrow="Engineering all-hands"
        description="The quarter got faster, quieter, and easier to review."
      />
    ),
  },`,
    label: "The opener",
    slide: "opening",
    summary:
      "A hero layout. The title comes from the slide, the notes stay off the canvas.",
  },
  {
    code: `  {
    slug: "figures",
    title: "The numbers that moved",
    body: (
      <OpenContentSlide eyebrow="Quarter in review">
        <StatGrid items={figures} />
      </OpenContentSlide>
    ),
  },`,
    label: "The numbers",
    slide: "figures",
    summary: "A stat grid inside an open frame. The figures are plain data.",
  },
  {
    code: `  {
    slug: "decision",
    title: "What we kept, changed, and removed",
    body: (
      <OpenContentSlide eyebrow="Decision">
        <CardGrid columns={3} items={decisions} />
      </OpenContentSlide>
    ),
  },`,
    label: "The decision",
    slide: "decision",
    summary: "The same frame with a card grid in it instead.",
  },
  {
    code: `  {
    slug: "close",
    title: "Make the first edit smaller",
    background: "closing",
    body: <BreakerSlide eyebrow="Next quarter" description={nextStep} />,
  },`,
    label: "The close",
    slide: "close",
    summary: "A breaker on the theme's closing background.",
  },
]

function lineCount(text: string) {
  return text.split("\n").length
}

export const demoCode = [head, ...entries.map((entry) => entry.code), "]"].join(
  "\n"
)

let nextLine = lineCount(head) + 1

export const demoSteps: DemoStep[] = entries.map(({ code, ...step }) => {
  const from = nextLine

  nextLine += lineCount(code)

  return { ...step, from, to: nextLine - 1 }
})

/*
 * The two ways in, shown as a toggle under the hero. The first is the command
 * the quickstart walks through. The second is the same start phrased for a
 * coding agent: one line to paste that names the outcome and the command.
 */
export const installCode = {
  agent:
    "Set up a new Deckard presentation in ./my-talk with npx @thebuilder/deckard-cli init",
  terminal: "npx @thebuilder/deckard-cli init my-talk",
} as const

export const cliCode = `deckard check-overflow    # fails, naming the slides the canvas clips
deckard contact-sheet     # every slide in one grid image
deckard export pdf        # one page per slide`
