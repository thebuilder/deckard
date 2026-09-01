import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"

import type { SlideDefinition } from "@deckard/core"
import { CodeBlock } from "@deckard/core/code-block"
import { SlideStep } from "@deckard/core/components"
import { discoverSlides } from "@deckard/core/discovery"
import type { ReactNode } from "react"
import { BulletList, FeatureGrid } from "@/app/slides/blocks/collections"
import { FullscreenMediaSlide } from "@/app/slides/blocks/media"
import { type Stat, StatGrid } from "@/app/slides/blocks/stats"
import {
  BreakerSlide,
  ContentSlideCard,
  HeroSlide,
  OpenContentSlide,
} from "@/app/slides/blocks/templates"
import { Eyebrow } from "@/app/slides/blocks/typography"
import "server-only"

// Eager: every module is in the bundle either way. The glob only saves the imports.
const discoveredSlides = discoverSlides(
  import.meta.glob("./slides/**/*.slide.tsx", { eager: true }),
  { sort: "order" }
)

const tokenPattern = /^\s*(--[\w-]+)\s*:/gm

async function countFiles(directory: string, suffix: string) {
  const entries = await readdir(path.join(process.cwd(), directory))

  return entries.filter((entry) => entry.endsWith(suffix)).length
}

async function readDeckStats(): Promise<Stat[]> {
  const [manifest, themeCss, slideModules, blocks] = await Promise.all([
    readFile(
      path.join(process.cwd(), "node_modules/@deckard/core/package.json"),
      "utf8"
    ),
    readFile(path.join(process.cwd(), "deck/theme/theme.css"), "utf8"),
    countFiles("deck/slides", ".slide.tsx"),
    countFiles("app/slides/blocks", ".tsx"),
  ])

  const entryPoints = Object.keys(
    (JSON.parse(manifest) as { exports: Record<string, string> }).exports
  ).filter((entry) => entry !== "./package.json")

  const tokens = new Set(
    [...themeCss.matchAll(tokenPattern)].map((match) => match[1])
  )

  return [
    {
      label: "Entry points",
      note: "Everything @deckard/core exposes, counted from the installed package.json.",
      value: String(entryPoints.length),
    },
    {
      label: "Slide modules",
      note: "Files under deck/slides that one eager glob turned into slides.",
      value: String(slideModules),
    },
    {
      label: "Deck blocks",
      note: "Layout, typography, collections, media, and one this deck added.",
      value: String(blocks),
    },
    {
      label: "Theme tokens",
      note: "Custom properties this deck redefines in deck/theme/theme.css.",
      value: String(tokens.size),
    },
  ]
}

async function DeckStatsSlide() {
  const stats = await readDeckStats()

  return (
    <ContentSlideCard
      description="Every number below was read off disk while this page rendered. The slide is an async Server Component, so nothing here is a screenshot of a number that used to be true."
      eyebrow="Counted at build time"
      title="This deck, measured while it rendered"
    >
      <StatGrid items={stats} />
    </ContentSlideCard>
  )
}

const deckSource = `import type { SlideDefinition } from "@deckard/core"
import { discoverSlides } from "@deckard/core/discovery"
import "server-only"

// Eager: every module is in the bundle either way. The glob only saves the imports.
const discoveredSlides = discoverSlides(
  import.meta.glob("./slides/**/*.slide.tsx", { eager: true }),
  { sort: "order" }
)

async function readDeckStats(): Promise<Stat[]> {
  const manifest = await readFile("node_modules/@deckard/core/package.json", "utf8")
  const entryPoints = Object.keys(JSON.parse(manifest).exports)

  return [{ label: "Entry points", value: String(entryPoints.length), note: "..." }]
}

async function DeckStatsSlide() {
  return <StatGrid items={await readDeckStats()} />
}

export const slides: SlideDefinition[] = [
  {
    slug: "cover",
    title: "Deckard: React presentations without the ceremony",
    notes: "Thirty seconds on why anyone should care, then the thesis.",
    body: <HeroSlide eyebrow="Deckard" title="React presentations without the ceremony" />
  },
  {
    slug: "thesis",
    title: "The pitch",
    background: "spotlight",
    body: <BreakerSlide eyebrow="The pitch" title="A slide is a component" />
  },

  // Nine files under deck/slides land here, in filename order.
  ...discoveredSlides,

  {
    slug: "numbers",
    title: "By the numbers",
    body: <DeckStatsSlide />
  },
  {
    title: "One rectangle, every screen",
    layout: "fullscreen",
    header: "hidden",
    background: "none",
    body: (
      <FullscreenMediaSlide
        media={{ kind: "image", src: "/canvas-field.svg", unoptimized: true }}
        overlay="strong"
      />
    )
  },
  {
    slug: "friction",
    title: "What it cost",
    stepCount: 4,
    body: <FrictionSlide />
  }
]`

function FrictionPhase({ body, label }: { body: ReactNode; label: string }) {
  return (
    <div className="grid grid-cols-[13rem_minmax(0,1fr)] items-baseline gap-6 border-[var(--slide-surface-border)] border-t pt-4">
      <p className="font-semibold text-[length:var(--slide-label-size)] text-primary uppercase tracking-[var(--slide-label-tracking)]">
        {label}
      </p>
      <p className="text-[length:var(--slide-support-size)] leading-[1.6]">
        {body}
      </p>
    </div>
  )
}

export const slides: SlideDefinition[] = [
  {
    body: (
      <HeroSlide
        description="The story of turning a slideshow into a framework, and the deck that had to be built before anyone could call the API stable."
        eyebrow="Deckard"
        title="React presentations without the ceremony"
      />
    ),
    notes: `Thirty seconds, no longer. Name the thing, name the audience, and get off the cover.

If the room is React developers, the one line that lands is that this deck is a Next.js app and you are looking at a route.`,
    slug: "cover",
    title: "Deckard: React presentations without the ceremony",
  },
  {
    background: "spotlight",
    body: (
      <BreakerSlide
        description="You already know how to build a chart, a form, and a live demo. A deck tool that makes you leave React to show one is solving a problem you do not have."
        eyebrow="The pitch"
        title="A slide is a component. The rest is chrome."
      />
    ),
    notes: `This is the argument. Everything after it is evidence.

The line to land: we already know how to build a chart, a form, and a live demo in React. A tool that makes you leave React to show one is charging you for the wrong thing.

Pause after the last sentence. Let it sit before you move.`,
    slug: "thesis",
    title: "The pitch",
  },
  {
    body: (
      <OpenContentSlide
        description="Four sections, one working deck. This talk is the deck, so anything described here is also on screen."
        eyebrow="The route"
        title="Four decisions, in the order we made them"
      >
        <BulletList
          items={[
            <>
              <strong>The canvas.</strong> One fixed rectangle, and everything
              that falls out of refusing to reflow it.
            </>,
            <>
              <strong>The slide.</strong> A plain object with a body, and the
              two places that object is allowed to live.
            </>,
            <>
              <strong>The theme.</strong> Files you own in your repository,
              rather than a config object you configure around.
            </>,
            <>
              <strong>The gate.</strong> The scripts that decide whether a deck
              is finished, because "it looked fine on my laptop" is not a check.
            </>,
          ]}
        />
      </OpenContentSlide>
    ),
    notes: `Read three of the four and let the last one land on its own.

Keep this under a minute. An agenda slide that takes two minutes has cost you the first section.`,
    title: "Where this goes",
  },
  {
    body: (
      <ContentSlideCard
        description="A Next.js app with a slideshow bolted into it. It worked, it shipped talks, and it was not a framework."
        eyebrow="Before"
        title="One app, and a file that kept growing"
      >
        <FeatureGrid
          items={[
            {
              description:
                "The keyboard handler, the theme switch, and the copy of every slide shared one route. Changing a headline meant scrolling past the navigation logic to reach it.",
              title: "Chrome and content in one file",
            },
            {
              description:
                "Nothing stopped a slide from importing the router, or a runtime component from hardcoding a color. Both happened, and neither was caught by anything.",
              title: "No boundary to defend",
            },
            {
              description:
                "A second deck meant copying the app and deleting the slides. That is not a starting point, that is a fork you will maintain twice.",
              title: "Nothing to reuse",
            },
          ]}
        />
      </ContentSlideCard>
    ),
    notes: `Be specific and unflattering. A migration talk with no before state is a sales pitch.

The detail that gets a laugh: changing a headline meant scrolling past the keyboard handler.

Do not linger. Ninety seconds, then into the canvas.`,
    title: "Where it started",
  },

  ...discoveredSlides,

  {
    body: (
      <ContentSlideCard
        description="The real file, trimmed. Nineteen slides, and this is all of the structure there is."
        eyebrow="Authoring"
        title="An array, a spread, and one async function"
      >
        <CodeBlock code={deckSource} language="tsx" maxHeight={540} />
      </ContentSlideCard>
    ),
    notes: `Scroll it while you talk. The block scrolls inside the slide, so the deck does not advance under you.

Three things to point at, in order: the glob, the spread in the middle of the array, and the async function that is also a slide.

Do not read the code. Nobody reads code off a screen. Say what it means and let them see the shape.`,
    slug: "code",
    title: "The deck file",
  },
  {
    body: <DeckStatsSlide />,
    notes: `The point is not the numbers, it is where they came from. This slide awaited four file reads and then returned markup.

Say the consequence: a slide that reads its own repository cannot go stale between the day you write it and the day you give the talk.

If someone asks about a database, the answer is the same shape. Await it, return the slide.`,
    slug: "numbers",
    title: "By the numbers",
  },
  {
    background: "none",
    body: (
      <FullscreenMediaSlide
        media={{
          alt: "A single 16 by 9 rectangle standing on a receding grid",
          kind: "image",
          priority: true,
          sizes: "100vw",
          src: "/canvas-field.svg",
          unoptimized: true,
        }}
        overlay="strong"
        variant="background"
      >
        <Eyebrow>Halfway</Eyebrow>
        <h1 className="mt-3 max-w-4xl text-balance font-semibold text-[length:var(--slide-heading-size)] text-[var(--slide-media-foreground)] tracking-tight">
          One rectangle, every screen
        </h1>
        <p className="mt-3 max-w-3xl text-[length:var(--slide-lead-size)] text-[var(--slide-media-foreground-muted)] leading-[1.6]">
          That is the architecture. The rest of this talk is what it cost to get
          there and what I would change before calling it stable.
        </p>
      </FullscreenMediaSlide>
    ),
    header: "hidden",
    layout: "fullscreen",
    notes: `Say nothing for a beat. This is the section break, and the picture is the sentence.

Then: everything before this was how the rectangle works. Everything after it is what the rectangle cost.`,
    title: "One rectangle, every screen",
  },
  {
    body: (
      <ContentSlideCard
        description="Building this deck on the framework was the last check before calling the API stable. Four things pushed back."
        eyebrow="Honestly"
        title="What the migration actually cost"
      >
        <div className="grid gap-3">
          <SlideStep step={0}>
            <FrictionPhase
              body={
                <>
                  The slide route is eighty lines of wiring and I copied every
                  one of them. Params, metadata, prefetch, the presenter preview
                  flag. Not one line is a decision this deck gets to make.
                </>
              }
              label="Copied, not written"
            />
          </SlideStep>

          <SlideStep step={1}>
            <FrictionPhase
              body={
                <>
                  A slide cannot read its own deck config. <code>deck.ts</code>{" "}
                  imports the slides, so a slide importing <code>deck.ts</code>{" "}
                  closes a cycle. The canvas size moved into its own module to
                  break it.
                </>
              }
              label="One import cycle"
            />
          </SlideStep>

          <SlideStep step={2}>
            <FrictionPhase
              body={
                <>
                  The theme is a fork. Installing broadsheet and changing four
                  things took ten minutes, and it also means every upstream fix
                  to that stylesheet is a fix this deck will never receive.
                </>
              }
              label="Owning the file, both ways"
            />
          </SlideStep>

          <SlideStep step={3}>
            <FrictionPhase
              body={
                <>
                  Raising the support type by three pixels clipped two slides,
                  and the checker named both. The fix was deleting a sentence
                  from each, which is the fix a deck deserves.
                </>
              }
              label="The gate did its job"
            />
          </SlideStep>
        </div>
      </ContentSlideCard>
    ),
    notes: `Four clicks, and do not soften any of them. A migration talk that reports no friction is a talk nobody believes.

The first one is the biggest: eighty lines of route wiring, copied verbatim, with no decision in it. If the framework is right, that file should not exist.

Land on the fourth. The tooling caught two real overflows, and the fix was cutting sentences. That is the system working, not the system failing.`,
    slug: "friction",
    stepCount: 4,
    title: "What it cost",
  },
  {
    body: (
      <OpenContentSlide
        description="This deck was the last check before freezing the API. Three things it argues should change first."
        eyebrow="Next"
        title="Three changes while the API is still soft"
      >
        <BulletList
          items={[
            <>
              <strong>Ship the route.</strong> A component in the package would
              delete the copied file and let the runtime add a search parameter
              without every deck migrating by hand.
            </>,
            <>
              <strong>Let a slide read its deck.</strong> Putting the resolved
              canvas in slide context costs nothing and removes the only import
              cycle in the model.
            </>,
            <>
              <strong>Give themes something to extend.</strong> A fork inherits
              nothing today, so a theme drifts from its origin silently and no
              check can tell.
            </>,
          ]}
        />
      </OpenContentSlide>
    ),
    notes: `Three asks, and be honest that the first one is the only one that matters.

If you only remember one line from this talk: the framework should own the route, because the route has no decisions in it.

Then hand it to questions. Do not add a fourth.`,
    title: "Before it is stable",
  },
  {
    body: (
      <HeroSlide
        description="A deck is app, components, deck, public, and a package.json. Everything you already know about a Next.js app is still true inside it."
        eyebrow="That is the talk"
        title="Delete the ceremony, keep the app"
      />
    ),
    notes: `Close on the app, not on the framework. The takeaway is that a deck is an app directory and everything you already know still applies.

Then stop talking.`,
    slug: "end",
    title: "Thank you",
  },
]
