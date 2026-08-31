import { BulletList, FeatureGrid } from "@/app/slides/blocks/collections"
import {
  FullscreenMediaSlide,
  ImageShowcaseSlide,
} from "@/app/slides/blocks/media"
import {
  BreakerSlide,
  ContentSlideCard,
  HeroSlide,
  OpenContentSlide,
} from "@/app/slides/blocks/templates"
import { Eyebrow } from "@/app/slides/blocks/typography"
import exampleBackgroundImage from "@/assets/example-background.png"
import templateCapabilitiesImage from "@/assets/template-capabilities.svg"
import { CodeBlock } from "@/components/slideshow/code-block"
import { SlideStep } from "@/components/slideshow/slide-stepper"
import "server-only"

import type { SlideDefinition } from "@/lib/deck/types"

export const slides: SlideDefinition[] = [
  {
    slug: "intro",
    title: "Slideshow Base",
    notes:
      "Welcome the audience, set context in one sentence, and preview what they will get from this walkthrough.",
    body: (
      <HeroSlide
        eyebrow="Reusable Next.js template"
        title="Build polished slides fast"
        description="Keyboard controls, step reveals, command center, themed UI, and flexible layout options out of the box."
      />
    ),
  },
  {
    title: "Capabilities",
    body: (
      <ContentSlideCard
        eyebrow="Capabilities"
        title="A production-ready slideshow baseline"
        description="The template focuses on practical presentation features you can reuse in demos, talks, and product walkthroughs."
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
      </ContentSlideCard>
    ),
  },
  {
    title: "Navigation",
    body: (
      <OpenContentSlide
        eyebrow="Navigation"
        title="Control the presentation without touching the URL"
      >
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
      </OpenContentSlide>
    ),
  },
  {
    title: "Step Reveals",
    notes:
      "Pause between each reveal and ask a short alignment question before advancing to the next step.",
    body: (
      <ContentSlideCard
        eyebrow="Stepped content"
        title="Reveal information in phases"
        description="This slide uses `stepCount={4}` with `SlideStep` blocks."
      >
        <div className="grid gap-3">
          <SlideStep step={0}>
            <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
              <p className="font-semibold text-muted-foreground text-xs uppercase tracking-[0.2em]">
                Step 1
              </p>
              <p className="mt-2 text-muted-foreground text-sm">
                Start with the core problem or context.
              </p>
            </div>
          </SlideStep>

          <SlideStep step={1}>
            <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
              <p className="font-semibold text-muted-foreground text-xs uppercase tracking-[0.2em]">
                Step 2
              </p>
              <p className="mt-2 text-muted-foreground text-sm">
                Add supporting evidence once the audience is aligned.
              </p>
            </div>
          </SlideStep>

          <SlideStep step={2}>
            <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
              <p className="font-semibold text-muted-foreground text-xs uppercase tracking-[0.2em]">
                Step 3
              </p>
              <p className="mt-2 text-muted-foreground text-sm">
                Show options and tradeoffs before deciding.
              </p>
            </div>
          </SlideStep>

          <SlideStep step={3}>
            <div className="rounded-2xl border border-primary/40 bg-primary/8 p-4">
              <p className="font-semibold text-primary text-xs uppercase tracking-[0.2em]">
                Step 4
              </p>
              <p className="mt-2 text-muted-foreground text-sm">
                Land on one recommendation and the next action.
              </p>
            </div>
          </SlideStep>
        </div>
      </ContentSlideCard>
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
          alt: "Capability map for the slideshow template",
          fit: "contain",
          caption: "Use this for diagrams, mockups, or campaign visuals.",
          credit: "Generated template asset",
        }}
      >
        <Eyebrow>Image slide</Eyebrow>
        <h2 className="font-semibold text-3xl tracking-tight">
          Media-first storytelling
        </h2>
        <p className="text-muted-foreground text-sm leading-7">
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
          src: exampleBackgroundImage,
          alt: "Example scenic background",
          placeholder: "blur",
          priority: true,
        }}
      >
        <Eyebrow>Fullscreen mode</Eyebrow>
        <h1 className="mt-3 text-balance font-semibold text-4xl text-white tracking-tight sm:text-5xl lg:text-6xl">
          Image and video can take over the full canvas
        </h1>
        <p className="mt-3 max-w-3xl text-base text-white/85 leading-7 sm:text-lg">
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
    notes: `Start this section by anchoring on the authoring contract: slides.tsx should remain definitions-only and all implementation detail should live in reusable blocks.

Call out that this keeps deck iteration fast because we can rearrange narrative flow without touching component logic.

Mention the practical editing flow:
1) add metadata (title, layout, background, stepCount),
2) compose with existing blocks,
3) only create new primitives when a pattern repeats.

Pause briefly on the code snippet and explicitly point to the commented fullscreen media example.

Close by reinforcing that this pattern is what makes the template scalable for future decks with different visual styles but identical navigation and presenter tooling.`,
    body: (
      <ContentSlideCard
        eyebrow="Authoring"
        title="Slide definitions stay small"
        description="Author slide metadata in one place and pull visuals from reusable components."
      >
        <CodeBlock
          code={`{
  slug: "image",
  title: "Image-first slide",
  body: (
    <ImageShowcaseSlide
      image={{ src: myImage, alt: "Capability map", placeholder: "blur" }}
    />
  ),
  // Fullscreen video with autoplay:
  // body: (
  //   <FullscreenMediaSlide
  //     media={{ kind: "video", src: "/videos/demo.mp4", autoplay: true }}
  //   />
  // ),
  layout: "fullscreen",
  background: "none",
  header: "hidden"
}`}
          language="typescript"
        />
      </ContentSlideCard>
    ),
  },
  {
    title: "Use It",
    body: (
      <HeroSlide
        eyebrow="Ready"
        title="Start from this template"
        description="Replace the demo slides, keep the structure, and ship presentation-grade decks faster."
      />
    ),
  },
]
