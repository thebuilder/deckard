import { SlideStep } from "@deckard/core/components"
import { FeatureGrid } from "@/app/slides/blocks/collections"
import {
  ContentSlideCard,
  HeroSlide,
} from "@/app/slides/blocks/templates"
import "server-only"

import type { SlideDefinition } from "@deckard/core"
import { discoverSlides } from "@deckard/core/discovery"

const discoveredSlides = discoverSlides(
  import.meta.glob("./slides/**/*.slide.tsx", { eager: true }),
  { sort: "order" }
)

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
      <ContentSlideCard
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
                "The theme. Colors, type sizes, and surfaces as CSS custom properties scoped to the slide canvas. THEME.md says which token does what.",
              title: "deck/theme/",
            },
            {
              description:
                "The blocks that lay out a slide. They are your files now, so change them instead of fighting them.",
              title: "app/slides/blocks/",
            },
          ]}
        />
      </ContentSlideCard>
    ),
  },
  {
    title: "Reveal in steps",
    notes: "Stop after each step. Let the room catch up before the next one.",
    stepCount: 3,
    body: (
      <ContentSlideCard
        description="stepCount={3} and one SlideStep per step. Arrow keys walk through them, and the presenter view shows what comes next."
        eyebrow="Stepped slides"
      >
        <div className="grid gap-3">
          <SlideStep step={0}>
            <p className="rounded-[var(--slide-radius)] border border-[var(--slide-surface-border)] bg-[var(--slide-surface-muted)] p-4 text-[length:var(--slide-support-size)] text-muted-foreground">
              A step is a wrapper. The content inside it is ordinary JSX.
            </p>
          </SlideStep>
          <SlideStep step={1}>
            <p className="rounded-[var(--slide-radius)] border border-[var(--slide-surface-border)] bg-[var(--slide-surface-muted)] p-4 text-[length:var(--slide-support-size)] text-muted-foreground">
              Steps live in the URL, so a reload lands on the same reveal.
            </p>
          </SlideStep>
          <SlideStep step={2}>
            <p className="rounded-[var(--slide-radius)] border border-primary/40 bg-primary/8 p-4 text-[length:var(--slide-support-size)] text-muted-foreground">
              Use them for an argument that builds. Do not use them to hide a
              list you could have cut.
            </p>
          </SlideStep>
        </div>
      </ContentSlideCard>
    ),
  },
  ...discoveredSlides,
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
