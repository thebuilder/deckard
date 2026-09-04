import {
  FeatureGrid,
  HeroSlide,
  OpenContentSlide,
  RevealList,
} from "@/app/slides/blocks"
import "server-only"

import type { SlideDefinition } from "@thebuilder/deckard-core"

const revealPoints = [
  {
    description: "The content inside a reveal is still ordinary React.",
    title: "Ordinary JSX",
  },
  {
    description: "Reloading the page returns to the same reveal step.",
    title: "Stable URLs",
  },
  {
    accent: true,
    description: "Reveal points when the sequence carries the argument.",
    title: "Build the case",
  },
] as const

export const slides: SlideDefinition[] = [
  {
    slug: "intro",
    title: "__DECK_TITLE__",
    notes: "Say the one sentence this talk exists to deliver, then move on.",
    body: (
      <HeroSlide
        description="Replace this deck with yours. The structure around it already works."
        eyebrow="A Deckard deck"
      />
    ),
  },
  {
    title: "Where things are",
    body: (
      <OpenContentSlide
        description="Three directories. Everything else is a normal Next.js app."
        eyebrow="The shape of this app"
      >
        <FeatureGrid
          items={[
            {
              description:
                "The slide array. Each entry needs a body. Everything else, slug, title, notes, stepCount, layout, background, is optional.",
              title: "deck/slides.tsx",
            },
            {
              description:
                "The deck config imports one built-in theme. Run deckard eject theme when you want its CSS and notes as files you can edit.",
              title: "deck/deck.ts",
            },
            {
              description:
                "The blocks that lay out a slide. They are your files now, so change them instead of fighting them.",
              title: "app/slides/blocks/",
            },
          ]}
        />
      </OpenContentSlide>
    ),
  },
  {
    title: "Reveal in steps",
    notes: "Stop after each step. Let the room catch up before the next one.",
    stepCount: revealPoints.length,
    body: (
      <OpenContentSlide
        description="Arrow keys reveal one point at a time. Presenter mode shows what comes next."
        eyebrow="Stepped slides"
      >
        <RevealList items={revealPoints} />
      </OpenContentSlide>
    ),
  },
  {
    title: "Over to you",
    body: (
      <HeroSlide
        description="Delete these slides, keep the wiring, and write the talk."
        eyebrow="Next"
        title="Start writing"
      />
    ),
  },
]
