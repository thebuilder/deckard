import type { SlideDefinition } from "@deckard/core"

import { BulletList, FeatureGrid } from "@/app/slides/blocks/collections"
import {
  FullscreenMediaSlide,
  ImageShowcaseSlide,
} from "@/app/slides/blocks/media"
import {
  BreakerSlide,
  HeroSlide,
  OpenContentSlide,
} from "@/app/slides/blocks/templates"
import { Eyebrow, SlideHeading } from "@/app/slides/blocks/typography"

const sampleImage = "/sample.svg"

export const slides: SlideDefinition[] = [
  {
    body: (
      <HeroSlide
        description="Every block on this deck arrived through shadcn add."
        eyebrow="Registry smoke"
      />
    ),
    slug: "hero",
    title: "Installed from the registry",
  },
  {
    body: (
      <BreakerSlide
        description="A section divider uses the same type as the hero, aligned left."
        eyebrow="Section"
      />
    ),
    title: "Layouts",
  },
  {
    body: (
      <OpenContentSlide
        description="The list brings its own frame, so the layout brings none."
        eyebrow="Collections"
      >
        <BulletList
          items={[
            "The theme landed in deck/theme and this app owns those files.",
            "The blocks landed in app/slides/blocks and import @deckard/core.",
            "The only build wiring is the stylesheet import the preset wrote.",
          ]}
        />
      </OpenContentSlide>
    ),
    title: "Bullets",
  },
  {
    body: (
      <OpenContentSlide eyebrow="Collections">
        <FeatureGrid
          items={[
            {
              description: "One stylesheet, scoped to the canvas.",
              title: "Theme",
            },
            { description: "Four families of slide frames.", title: "Blocks" },
            { description: "One add for both.", title: "Preset" },
          ]}
        />
      </OpenContentSlide>
    ),
    title: "Grid",
  },
  {
    body: (
      <ImageShowcaseSlide
        image={{ alt: "A placeholder", caption: "A caption", src: sampleImage }}
      >
        <SlideHeading description="Image left, copy right." title="Showcase" />
      </ImageShowcaseSlide>
    ),
    layout: "fullscreen",
    title: "Showcase",
  },
  {
    body: (
      <FullscreenMediaSlide
        media={{ alt: "A placeholder", kind: "image", src: sampleImage }}
        overlay="strong"
      >
        <Eyebrow>Media</Eyebrow>
      </FullscreenMediaSlide>
    ),
    layout: "fullscreen",
    title: "Fullscreen",
  },
]
