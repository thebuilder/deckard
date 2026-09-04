import type { SlideDefinition } from "@thebuilder/deckard-core"
import { CardGrid, ContentsList } from "@/app/slides/blocks/collections"
import { ImageShowcaseSlide } from "@/app/slides/blocks/media"
import { StatGrid } from "@/app/slides/blocks/metrics"
import { QuoteSlide } from "@/app/slides/blocks/prose"
import { Timeline } from "@/app/slides/blocks/tables"
import {
  BreakerSlide,
  HeroSlide,
  OpenContentSlide,
} from "@/app/slides/blocks/templates"
import { Eyebrow, SlideHeading } from "@/app/slides/blocks/typography"
import signalImage from "@/assets/incoming-signal.webp"
import { exampleOutline } from "@/deck/example-outline"

export const exampleSlides: SlideDefinition[] = [
  {
    ...exampleOutline.opening,
    body: (
      <HeroSlide
        description="The quarter got faster, quieter, and easier to review."
        eyebrow="Engineering all-hands"
        meta={["Use ← → to navigate", "⌘K to jump"]}
      />
    ),
    notes: "Name the outcome. Leave the implementation for the next slide.",
  },
  {
    ...exampleOutline.agenda,
    body: (
      <OpenContentSlide eyebrow="Run of show">
        <ContentsList
          items={[
            { folio: "03", title: "The numbers" },
            { folio: "04", title: "The decision" },
            { folio: "06", title: "What changes next" },
          ]}
        />
      </OpenContentSlide>
    ),
  },
  {
    ...exampleOutline.figures,
    body: (
      <OpenContentSlide eyebrow="Quarter in review">
        <StatGrid
          items={[
            { caption: "Median build time", value: "6.2s" },
            { caption: "Slides fixed after export", unit: "%", value: "0" },
            { caption: "Decks shipped", value: "31" },
          ]}
        />
      </OpenContentSlide>
    ),
    notes:
      "Pause on export fixes. It is the quality signal, not the speed figure.",
  },
  {
    ...exampleOutline.decision,
    body: (
      <OpenContentSlide eyebrow="Decision">
        <CardGrid
          columns={3}
          items={[
            {
              description: "Typed slide data and ordinary React.",
              title: "Keep",
            },
            {
              accent: true,
              description: "Start authors from intent, not package names.",
              title: "Change",
            },
            {
              description: "Copied styling from the deck definition.",
              title: "Remove",
            },
          ]}
        />
      </OpenContentSlide>
    ),
  },
  {
    ...exampleOutline.fieldNotes,
    body: (
      <ImageShowcaseSlide
        image={{
          alt: "A signal visualization used in the prototype",
          caption: "The first test run, captured before the review.",
          src: signalImage,
        }}
      >
        <Eyebrow>Field notes</Eyebrow>
        <SlideHeading
          description="One image, its context, and the decision it changed."
          title="The prototype in use"
        />
      </ImageShowcaseSlide>
    ),
  },
  {
    ...exampleOutline.roadmap,
    body: (
      <OpenContentSlide eyebrow="Plan">
        <Timeline
          items={[
            {
              date: "April",
              detail: "Test the authoring flow.",
              done: true,
              label: "Prototype",
            },
            { date: "May", detail: "Run two real talks.", label: "Pilot" },
            {
              date: "June",
              detail: "Publish the stable contract.",
              label: "Release",
            },
          ]}
        />
      </OpenContentSlide>
    ),
  },
  {
    ...exampleOutline.review,
    body: (
      <QuoteSlide
        attribution="Maya Chen"
        quote="The useful part is that I can still read the source after the demo."
        source="Design review"
      />
    ),
  },
  {
    ...exampleOutline.close,
    background: "accent",
    body: (
      <BreakerSlide
        description="Keep the source readable when the presentation becomes real."
        eyebrow="Next quarter"
      />
    ),
  },
]
