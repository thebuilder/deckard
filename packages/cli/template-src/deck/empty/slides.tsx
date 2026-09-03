import type { SlideDefinition } from "@thebuilder/deckard-core"
import { ContentSlideCard, HeroSlide } from "@/app/slides/blocks/templates"
import "server-only"

export const slides: SlideDefinition[] = [
  {
    slug: "intro",
    title: "__DECK_TITLE__",
    body: <HeroSlide eyebrow="A Deckard deck" />,
  },
  {
    title: "Second slide",
    body: (
      <ContentSlideCard
        description="Add slides to this array. A slide needs only a body."
        eyebrow="Write here"
      >
        <p className="text-[length:var(--slide-body-size)] text-muted-foreground">
          Move a slide into deck/slides/name.slide.tsx once it grows its own
          data or widgets, then spread discoverSlides() into this array.
        </p>
      </ContentSlideCard>
    ),
  },
]
