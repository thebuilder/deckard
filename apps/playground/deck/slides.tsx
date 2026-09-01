import { CodeBlock } from "@deckard/core/code-block"
import { SlideStep } from "@deckard/core/components"
import { BulletList, FeatureGrid } from "@/app/slides/blocks/collections"
import {
  FullscreenMediaSlide,
  ImageShowcaseSlide,
} from "@/app/slides/blocks/media"
import {
  BreakerSlide,
  FocusSlide,
  HeroSlide,
  OpenContentSlide,
} from "@/app/slides/blocks/templates"
import { Eyebrow } from "@/app/slides/blocks/typography"
import incomingSignalImage from "@/assets/incoming-signal.webp"
import templateCapabilitiesImage from "@/assets/template-capabilities.svg"
import "server-only"

import type { SlideDefinition } from "@deckard/core"
import { discoverSlides } from "@deckard/core/discovery"

// Eager: every module is in the bundle either way. The glob only saves the imports.
const discoveredSlides = discoverSlides(
  import.meta.glob("./slides/**/*.slide.tsx", { eager: true }),
  { sort: "order" }
)

interface RevealCardProps {
  children: React.ReactNode
  label: string
}

function RevealCardBody({ children, label }: RevealCardProps) {
  return (
    <>
      <p className="font-semibold text-[length:var(--slide-support-size)] uppercase tracking-[0.2em]">
        {label}
      </p>
      <p className="mt-2 text-[length:var(--slide-body-size)] text-muted-foreground leading-[1.4]">
        {children}
      </p>
    </>
  )
}

function RevealCard({ children, label }: RevealCardProps) {
  return (
    <div
      className="rounded-[var(--slide-radius)] border border-[var(--slide-surface-border)] bg-[var(--slide-surface-muted)] p-5 text-muted-foreground"
      data-slide-surface=""
    >
      <RevealCardBody label={label}>{children}</RevealCardBody>
    </div>
  )
}

function RevealLandingCard({ children, label }: RevealCardProps) {
  return (
    <div
      className="rounded-[var(--slide-radius)] border border-primary/40 bg-primary/8 p-5 text-primary"
      data-slide-surface=""
    >
      <RevealCardBody label={label}>{children}</RevealCardBody>
    </div>
  )
}

const vitalsDelayMs = 40

async function loadDeckVitals() {
  await new Promise((resolve) => {
    setTimeout(resolve, vitalsDelayMs)
  })

  return [
    {
      description:
        "The route waited for this data before it sent any HTML, so the audience never watches a slide fill itself in.",
      title: `Awaited ${vitalsDelayMs}ms`,
    },
    {
      description:
        "The query, its credentials, and its result stay on the server. The browser gets markup.",
      title: "Nothing shipped to the client",
    },
    {
      description:
        "An async body is still one entry in this array, with the same metadata, notes, and navigation.",
      title: "Same slide contract",
    },
  ]
}

async function DeckVitalsSlide() {
  const vitals = await loadDeckVitals()

  return (
    <OpenContentSlide
      description="This body is an async Server Component. It awaits its data, then returns the slide."
      eyebrow="Server components"
      title="Slides can fetch their own data"
    >
      <FeatureGrid items={vitals} />
    </OpenContentSlide>
  )
}

export const slides: SlideDefinition[] = [
  {
    slug: "intro",
    title: "Deckard",
    notes:
      "Welcome the audience, set context in one sentence, and preview what they will get from this walkthrough.",
    body: (
      <HeroSlide
        eyebrow="React presentation framework"
        title="Build polished slides fast"
        description="Keyboard controls, step reveals, command center, themed UI, and flexible layout options out of the box."
        meta={["14 slides", "Deckard 0.0.1", "March 2026"]}
      />
    ),
  },
  {
    title: "Capabilities",
    body: (
      <OpenContentSlide
        eyebrow="Capabilities"
        title="A production-ready presentation baseline"
        description="Deckard focuses on practical presentation features you can reuse in demos, talks, and product walkthroughs."
      >
        <FeatureGrid
          items={[
            {
              title: "Step-based reveals",
              description:
                "Progressively reveal dense content with `stepCount` and `SlideStep`, while preserving keyboard and click progression.",
            },
            {
              title: "Fast navigation",
              description:
                "Arrow keys + command center (`Cmd/Ctrl + K`) make it easy to jump and control flow live.",
            },
            {
              title: "Theme support",
              description:
                "Built-in light/dark switching works with shadcn tokens so slides match your app styling.",
            },
            {
              title: "Config-driven metadata",
              description:
                "One shared config powers document metadata and header branding, reducing duplicated strings.",
            },
            {
              title: "Layout control",
              description:
                "Use default or fullscreen layout per slide without custom wrappers or route-level hacks.",
            },
            {
              title: "Background variants",
              description:
                "Switch between default, spotlight, grid, or no background for different storytelling moments.",
            },
          ]}
        />
      </OpenContentSlide>
    ),
  },
  {
    title: "Navigation",
    notes:
      "Nothing on this slide but the four ways to move. Demonstrate each one as you read it, and let the room watch the deck answer.",
    body: (
      <FocusSlide kicker="Presenting without touching the URL">
        <BulletList
          items={[
            <>
              Use <code>Arrow Left</code> / <code>Arrow Right</code> for
              previous/next.
            </>,
            <>
              Use <code>Page Up</code> / <code>Page Down</code> for the same
              flow when presenting.
            </>,
            <>
              Hit <code>Cmd/Ctrl + K</code> to open the command center and jump
              to any slide.
            </>,
            <>
              Click anywhere outside interactive controls to advance within a
              stepped slide.
            </>,
          ]}
        />
      </FocusSlide>
    ),
  },
  {
    title: "Step Reveals",
    notes:
      "Pause between each reveal and ask a short alignment question before advancing to the next step.",
    body: (
      <OpenContentSlide
        eyebrow="Stepped content"
        title="Reveal information in phases"
        description="This slide uses `stepCount={4}` with `SlideStep` blocks."
      >
        <div className="grid gap-3">
          <SlideStep step={0}>
            <RevealCard label="Step 1">
              Start with the core problem or context.
            </RevealCard>
          </SlideStep>

          <SlideStep step={1}>
            <RevealCard label="Step 2">
              Add supporting evidence once the audience is aligned.
            </RevealCard>
          </SlideStep>

          <SlideStep step={2}>
            <RevealCard label="Step 3">
              Show options and tradeoffs before deciding.
            </RevealCard>
          </SlideStep>

          <SlideStep step={3}>
            <RevealLandingCard label="Step 4">
              Land on one recommendation and the next action.
            </RevealLandingCard>
          </SlideStep>
        </div>
      </OpenContentSlide>
    ),
    stepCount: 4,
  },
  {
    title: "Layout and Background",
    body: (
      <BreakerSlide
        eyebrow="Layout + background"
        title="Each slide can pick its own frame"
        description="Use per-slide `layout`, `header`, and `background` settings to switch from standard narrative mode to fullscreen visual mode."
      />
    ),
    background: "spotlight",
  },
  {
    title: "Image Slide",
    body: (
      <ImageShowcaseSlide
        image={{
          src: templateCapabilitiesImage,
          alt: "Capability map for Deckard",
          caption: "Use this for diagrams, mockups, or campaign visuals.",
          credit: "Generated template asset",
        }}
      >
        <Eyebrow>Image slide</Eyebrow>
        <h2 className="font-semibold text-[length:var(--slide-subheading-size)] tracking-tight">
          Media-first storytelling
        </h2>
        <p className="text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.7]">
          Keep image slides as regular `body` composition with reusable
          components.
        </p>
      </ImageShowcaseSlide>
    ),
    layout: "fullscreen",
    background: "grid",
  },
  {
    title: "Fullscreen",
    body: (
      <FullscreenMediaSlide
        variant="background"
        overlay="strong"
        media={{
          kind: "image",
          src: incomingSignalImage,
          alt: "Wireframe monolith rising over a glowing signal grid",
          placeholder: "blur",
          priority: true,
        }}
      >
        <Eyebrow>Fullscreen mode</Eyebrow>
        <h1 className="mt-3 text-balance font-semibold text-[length:var(--slide-heading-size)] text-[var(--slide-media-foreground)] tracking-tight">
          Image and video can take over the full canvas
        </h1>
        <p className="mt-3 max-w-3xl text-[length:var(--slide-lead-size)] text-[var(--slide-media-foreground-muted)] leading-[1.6]">
          Use fullscreen media for transitions, product trailers, launch
          moments, or immersive visual slides.
        </p>
      </FullscreenMediaSlide>
    ),
    layout: "fullscreen",
    header: "hidden",
    background: "none",
  },
  {
    slug: "authoring",
    title: "Authoring Example",
    notes: `This is the whole authoring contract on one slide, so read it out rather than talking over it.

A slide is metadata plus a body. The body is a block, and the block is where every class name and every token lives. Nothing on this slide is a layout decision made twice.

That split is what keeps the deck cheap to rearrange: reordering the array moves the talk, and no component changes.

Point at the last line. The spread is discovery, and the three slides after it are files in deck/slides that this array never names.

Say what is missing on purpose: no heading, no lead, no panel. The slide is the code, which is the point of the focus layout.`,
    body: (
      <FocusSlide kicker="deck/slides.tsx">
        <CodeBlock
          code={`export const slides: SlideDefinition[] = [
  {
    slug: "pricing",
    title: "What it costs",
    body: (
      <OpenContentSlide eyebrow="Pricing" title="Tiers">
        <FeatureGrid items={tiers} />
      </OpenContentSlide>
    ),
  },
  {
    title: "Rollout",
    stepCount: 3,
    body: <RolloutSlide />,
  },
  ...discoveredSlides,
]`}
          language="typescript"
        />
      </FocusSlide>
    ),
  },
  {
    slug: "server-data",
    title: "Server Data",
    notes:
      "Say plainly that the slide awaited its own data before rendering. Then point at the 40ms number, it came back from that call.",
    body: <DeckVitalsSlide />,
  },
  ...discoveredSlides,
  {
    title: "Use It",
    body: (
      <HeroSlide
        eyebrow="Ready"
        title="Start from Deckard"
        description="Replace the demo slides, keep the structure, and ship presentation-grade decks faster."
        meta={["npx shadcn add deckard", "deckard.dev"]}
      />
    ),
  },
]
