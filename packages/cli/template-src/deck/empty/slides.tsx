import type { SlideDefinition } from "@thebuilder/deckard-core"
import { HeroSlide } from "@/app/slides/blocks"
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
      <HeroSlide
        description="Add slides to this array. Move one into deck/slides/name.slide.tsx when it needs its own data or widgets."
        eyebrow="Write here"
        title="A slide needs only a body"
      />
    ),
  },
]
