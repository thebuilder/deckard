import { CodeBlock } from "@deckard/core/code-block"
import { SlideStep } from "@deckard/core/components"
import {
  BulletList,
  CardGrid,
  ColumnGrid,
  ContentsList,
  FeatureGrid,
} from "@/app/slides/blocks/collections"
import {
  FullscreenMediaSlide,
  ImageShowcaseSlide,
  MediaGallery,
  MediaPair,
} from "@/app/slides/blocks/media"
import { ProseSlide, QuoteSlide } from "@/app/slides/blocks/prose"
import { DataTable, LogList, Timeline } from "@/app/slides/blocks/tables"
import {
  BreakerSlide,
  CodeSplitSlide,
  FocusSlide,
  HeroCenteredSlide,
  HeroSlide,
  HeroSplitSlide,
  MinimalBreakerSlide,
  OpenContentSlide,
  StatementSlide,
} from "@/app/slides/blocks/templates"
import { Eyebrow } from "@/app/slides/blocks/typography"
import deckViewImage from "@/assets/deck-view.png"
import incomingSignalImage from "@/assets/incoming-signal.webp"
import presenterWindowImage from "@/assets/presenter-window.png"
import { canvas } from "@/deck/canvas"
import {
  CanvasScaleCalculator,
  type Screen,
} from "@/deck/slides/canvas-scale-widget"
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
      <p className="font-semibold text-[length:var(--slide-label-size)] uppercase tracking-[0.2em]">
        {label}
      </p>
      <p className="mt-2 text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.4]">
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

// Exported so the numbers slide reports the delay rather than repeating it.
export const vitalsDelayMs = 40

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

// Real screens the deck lands on, so the multiplier is one a room recognises.
const screens: Screen[] = [
  { height: 900, id: "laptop", label: "Laptop 1440x900", width: 1440 },
  { height: 1080, id: "projector", label: "Projector 1920x1080", width: 1920 },
  { height: 1440, id: "ultrawide", label: "Ultrawide 3440x1440", width: 3440 },
  { height: 768, id: "tablet", label: "Tablet 1024x768", width: 1024 },
  { height: 844, id: "phone", label: "Phone 390x844", width: 390 },
]

export const slides: SlideDefinition[] = [
  {
    slug: "intro",
    title: "Deckard",
    notes:
      "One sentence of context: this deck is the framework rendering itself. Every layout you are about to see is a component in app/slides/blocks, and the talk is a TypeScript array.",
    body: (
      <HeroSlide
        eyebrow="React presentation framework"
        title="A deck you can edit in the editor you already have"
        description="Deckard renders slides as Next.js routes. A slide is an object in an array, a layout is a React component, and a theme is one stylesheet on the canvas."
        meta={["Deckard 0.0.1", "March 2026"]}
      />
    ),
  },
  {
    slug: "contents",
    title: "Run of Show",
    notes:
      "Read the six lines and stop. The folio numbers are the slide each section starts on, so anyone who wants to skip ahead can.",
    body: (
      <OpenContentSlide
        eyebrow="Run of show"
        title="Six sections, forty minutes"
        description="The folio is the slide each section opens on."
      >
        <ContentsList
          items={[
            { folio: "04", title: "What a slide is made of" },
            { folio: "07", title: "Blocks, and the one-surface rule" },
            { folio: "10", title: "The canvas, and media on it" },
            { folio: "18", title: "Writing the deck, and the data it fetches" },
            { folio: "25", title: "Themes and the token contract" },
            { folio: "29", title: "Checking a deck before you present it" },
          ]}
        />
      </OpenContentSlide>
    ),
  },
  {
    slug: "premise",
    title: "The Premise",
    notes:
      "This is the whole argument. Say it once, let it sit, and move on. Everything after this slide is evidence for it.",
    body: (
      <StatementSlide
        source="The argument"
        statement="A deck is code, so the parts you repeat should be components and the parts you rewrite every time should be text."
      />
    ),
    background: "accent",
  },
  {
    slug: "anatomy",
    title: "Anatomy",
    notes:
      "Three columns, three files. Point at each one and name the file it lives in: deck/slides.tsx, app/slides/blocks, packages/themes.",
    body: (
      <OpenContentSlide
        eyebrow="Anatomy"
        title="A slide is metadata plus a body"
        description="Three files, and each one answers a different question."
      >
        <ColumnGrid
          items={[
            {
              label: "deck/slides.tsx",
              text: "slug, title, notes, stepCount, and the frame overrides. Reordering the array reorders the talk, and no component changes.",
              title: "What the slide is",
            },
            {
              label: "app/slides/blocks",
              text: "The body. One component out of the catalogue, or your own markup on the days none of them fits what you are saying.",
              title: "How it is laid out",
            },
            {
              label: "packages/themes",
              text: "Tokens and part attributes. It restyles the pieces a block named for it and never puts a word of its own on the slide.",
              title: "What it looks like",
            },
          ]}
        />
      </OpenContentSlide>
    ),
  },
  {
    slug: "capabilities",
    title: "The Runtime",
    body: (
      <OpenContentSlide
        eyebrow="The runtime"
        title="What you would otherwise rebuild every talk"
        description="None of this is slide content, and all of it is the same for every deck."
      >
        <FeatureGrid
          items={[
            {
              description:
                "Arrow keys, a clicker, and Cmd/Ctrl + K to jump to a slide by title. P opens the presenter window.",
              title: "Presenting",
            },
            {
              description:
                "stepCount and SlideStep hold hidden content in the layout, so a slide never resizes as you reveal it.",
              title: "Step reveals",
            },
            {
              description:
                "deckard export pdf renders every slide at 1920x1080 through the route the browser uses.",
              title: "Export",
            },
          ]}
        />
      </OpenContentSlide>
    ),
  },
  {
    slug: "presenter",
    title: "Presenter View",
    notes: `Open the window here. Press P, drag it to the second screen, and arrow through while the room watches the two stay in sync.

The notes you are reading are the demo. Say that.

If the room is a single screen, describe it instead of showing it.`,
    body: (
      <OpenContentSlide
        eyebrow="Presenting"
        title="Notes and the next slide"
        description="What the lectern needs, on a screen the room never sees."
      >
        <BulletList
          items={[
            <>
              <code>P</code> opens <code>/presenter</code> in a second window. A{" "}
              <code>BroadcastChannel</code> holds both on the same slide and
              step, in either direction.
            </>,
            <>
              Notes are a plain string on the slide. The console renders them at
              a size you set from the lectern, beside a timer and a clock.
            </>,
            <>
              The next-slide preview is the real route with{" "}
              <code>?presenterPreview=1</code>, not a thumbnail. Media holds
              still in there, and <code>useIsPresenterPreview()</code> lets your
              widgets do the same.
            </>,
          ]}
        />
      </OpenContentSlide>
    ),
  },
  {
    slug: "blocks",
    title: "Blocks",
    body: <MinimalBreakerSlide title="Blocks" />,
  },
  {
    slug: "navigation",
    title: "Navigation",
    notes:
      "Nothing on this slide but the four ways to move. Demonstrate each one as you read it, and let the room watch the deck answer.",
    body: (
      <FocusSlide kicker="Presenting without touching the URL">
        <BulletList
          items={[
            <>
              <code>Arrow Left</code> and <code>Arrow Right</code> step through
              the deck one slide at a time
            </>,
            <>
              <code>Page Up</code> and <code>Page Down</code> do the same, which
              is what a presentation clicker sends
            </>,
            <>
              <code>Cmd/Ctrl + K</code> opens the command center and jumps to
              any slide by its title
            </>,
            <>
              A click anywhere outside a control advances the current slide to
              its next step
            </>,
          ]}
        />
      </FocusSlide>
    ),
  },
  {
    slug: "one-surface",
    title: "One Surface",
    notes:
      "The accent card is the recommendation. Say why the rule exists: a bordered panel full of bordered cards reads as a form, not a slide, and the runtime warns you in development when you build one.",
    body: (
      <OpenContentSlide
        eyebrow="Composition"
        title="One surface per slide"
        description="Pick the layout by what the body already brings with it."
      >
        <CardGrid
          columns={2}
          items={[
            {
              description:
                "The body is a paragraph or a short definition list with no frame of its own. The panel gives it one.",
              label: "Flat body",
              title: "ContentSlideCard",
            },
            {
              description:
                "The body is a BulletList, a StatGrid, a table. It draws its own rules, so the slide stays open around it.",
              label: "Framed body",
              title: "OpenContentSlide",
              accent: true,
            },
            {
              description:
                "The block is the whole point and the heading was scaffolding. Code, one image, three figures.",
              label: "No heading",
              title: "FocusSlide",
            },
            {
              description:
                "Put a block carrying data-slide-surface inside a panel and the console names the two layouts to use instead.",
              label: "In development",
              title: "The console warning",
            },
          ]}
        />
      </OpenContentSlide>
    ),
  },
  {
    slug: "canvas",
    title: "The Canvas",
    body: (
      <BreakerSlide
        eyebrow="The canvas"
        index="02"
        title="One rectangle, and the frame on it"
        description="layout, header, footer, and background are fields on the slide, so a fullscreen shot in the middle of a talk needs no route of its own."
      />
    ),
    background: "spotlight",
  },
  {
    slug: "fixed-canvas",
    title: "Fixed Canvas",
    notes: `This is the decision the rest of the deck hangs off, so slow down here.

Say it as a trade: you give up reflow, and you get a layout you can trust. Nobody has ever watched a deck on a projector and been pleased that the third bullet wrapped differently.

If someone asks about phones, the answer is that a phone gets this slide at a fifth of the size. It is small, and it is correct. The next slide lets you watch that happen.`,
    body: (
      <OpenContentSlide
        eyebrow="The canvas"
        title="One rectangle, decided once"
        description={`Every slide is authored at ${canvas.width} by ${canvas.height}. The viewport scales that rectangle to fit the window and centers it.`}
      >
        <BulletList
          items={[
            <>
              Size against the canvas: <code>h-full</code>, percentages, fixed
              pixels. <code>vh</code> and <code>sm:</code> answer to the browser
              window, and the browser window is not the slide.
            </>,
            <>
              The default frame reserves room for the header and the footer.{" "}
              <code>layout: "fullscreen"</code> hands the whole rectangle over,
              so media can bleed to every edge.
            </>,
            <>
              What does not fit is clipped rather than shrunk, so the size you
              author is the size that projects.
            </>,
          ]}
        />
      </OpenContentSlide>
    ),
  },
  {
    slug: "scale",
    title: "Contain Fit",
    notes: `Click through the screens rather than reading the numbers out. The ultrawide preset is the one that lands: it gives you letterbox bars down the sides, not a wider slide.

Then point at the type readout. The same authored heading is a different number of real pixels on every preset, which is why theme sizes look enormous while you edit them and correct while you present them.

The whole widget is one min() call. Say that out loud, it is the entire fitting model.`,
    body: (
      <OpenContentSlide
        eyebrow="Contain fit"
        title="Pick a screen, watch the multiplier"
        description="The canvas does not reflow, it multiplies. Every number here falls out of one min() over the window."
      >
        <CanvasScaleCalculator
          canvasHeight={canvas.height}
          canvasWidth={canvas.width}
          screens={screens}
        />
      </OpenContentSlide>
    ),
  },
  {
    slug: "clipping",
    title: "Clipping",
    notes: `Three clicks, and the third one is the argument.

First click: the amber outline. Development only, and the thing you notice while you are writing.

Second click: the same measurement as a gate, so the warning and the failure can never disagree.

Third click: hold here. The temptation is to shrink the type, and shrinking the type is how a deck ends up unreadable from row eight. Cut the sentence.`,
    body: (
      <OpenContentSlide
        eyebrow="Clipping"
        title="The canvas clips, and CI fails on it"
        description="Each block below is a SlideStep, revealed in order."
      >
        <div className="grid gap-3">
          <SlideStep step={0}>
            <RevealCard label="While you write">
              An amber outline and one console line, naming the slide and the
              overflow in pixels. Development only.
            </RevealCard>
          </SlideStep>

          <SlideStep step={1}>
            <RevealCard label="On the way in">
              <code>deck:check-overflow</code> runs that same measurement and
              exits nonzero, naming every slide that loses content to the canvas
              edge, the chrome, or a box that hides its own overflow.
            </RevealCard>
          </SlideStep>

          <SlideStep step={2}>
            <RevealLandingCard label="The fix">
              Cut a bullet, or wrap the part that has to scroll in{" "}
              <code>SlideScrollArea</code>. Shrinking the type is not a fix.
            </RevealLandingCard>
          </SlideStep>
        </div>
      </OpenContentSlide>
    ),
    stepCount: 3,
  },
  {
    slug: "image",
    title: "Image Slide",
    notes:
      "Copy on the left, the shot on the right, caption under it. Point out the gutters: this is the ordinary frame padding, not a fullscreen layout.",
    body: (
      <ImageShowcaseSlide
        image={{
          src: deckViewImage,
          alt: "The Deckard deck view, with a slide on the canvas and the deck controls in the corner",
          caption:
            "The canvas is a fixed 1920 by 1080 and scales to fit the window, so what you write is what projects.",
          credit: "Deckard 0.0.1",
          fit: "contain",
        }}
      >
        <Eyebrow>Split layout</Eyebrow>
        <h2 className="font-semibold text-[length:var(--slide-subheading-size)] tracking-tight">
          A picture and the sentence it needs
        </h2>
        <p className="text-[length:var(--slide-support-size)] text-muted-foreground leading-[1.5]">
          The copy column takes the measure and the media column takes the rest.
          Both sit inside the frame padding, so the image never runs off the
          canvas edge.
        </p>
      </ImageShowcaseSlide>
    ),
    background: "grid",
  },
  {
    slug: "two-up",
    title: "Two Up",
    notes:
      "Two frames, two captions, one row. Use it when the comparison is the point and neither image wins.",
    body: (
      <MediaPair
        items={[
          {
            alt: "The deck view with the slide canvas filling the window",
            caption:
              "The deck view. The canvas scales to the window and the controls dock in the corner.",
            fit: "contain",
            src: deckViewImage,
          },
          {
            alt: "The presenter window, showing notes, a clock, and the next slide",
            caption:
              "The presenter window, opened with P. Notes, a clock, and the slide you are about to show.",
            fit: "contain",
            src: presenterWindowImage,
          },
        ]}
      />
    ),
  },
  {
    slug: "gallery",
    title: "Gallery",
    notes:
      "Three frames on one grid. The count is a prop, so a fourth is an array entry rather than a new component.",
    body: (
      <MediaGallery
        columns={3}
        items={[
          {
            alt: "The deck view",
            caption: "Deck view, canvas scaled to the window",
            fit: "contain",
            src: deckViewImage,
          },
          {
            alt: "The presenter window",
            caption: "Presenter window, notes and next slide",
            fit: "contain",
            src: presenterWindowImage,
          },
          {
            alt: "A wireframe monolith rising over a glowing signal grid",
            caption: "A full bleed slide, at the export size",
            src: incomingSignalImage,
          },
        ]}
      />
    ),
  },
  {
    slug: "fullscreen",
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
        <Eyebrow>Fullscreen</Eyebrow>
        <h1 className="mt-3 text-balance font-semibold text-[length:var(--slide-heading-size)] text-[var(--slide-media-foreground)] tracking-tight">
          One image, every pixel of the canvas
        </h1>
        <p className="mt-3 max-w-3xl text-[length:var(--slide-lead-size)] text-[var(--slide-media-foreground-muted)] leading-[1.5]">
          The frame drops its padding and the chrome goes with it. The copy sits
          on a scrim so it stays readable over whatever the shot is doing.
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

A slide is metadata plus a body. The body is a block, and the block is where every class name and every token lives.

That split is what keeps the deck cheap to rearrange: reordering the array moves the talk, and no component changes.

Point at the last line. The spread is discovery, and every slide after it is a file in deck/slides that this array never names.

Say what is missing: no heading, no lead, no panel. The slide is the code, which is what the focus layout is for.`,
    body: (
      <FocusSlide kicker="deck/slides.tsx">
        <CodeBlock
          code={`export const slides: SlideDefinition[] = [
  {
    title: "What it costs",
    body: (
      <OpenContentSlide eyebrow="Pricing" title="Tiers">
        <FeatureGrid items={tiers} />
      </OpenContentSlide>
    ),
  },
  { title: "Rollout", stepCount: 3, body: <RolloutSlide /> },
  ...discoveredSlides,
]`}
          language="typescript"
        />
      </FocusSlide>
    ),
  },
  {
    slug: "code-notes",
    title: "Code and Notes",
    notes:
      "Read the three notes, not the code. The code is there so the room can see the shape while you talk about what it means.",
    body: (
      <CodeSplitSlide
        kicker="The contents slide, four slides back"
        notes={[
          "The array is the content. Reorder it and the section list reorders, with no component touched.",
          "Leave the numeral out and the block writes 01, 02, 03. Ledger counts those into roman numerals from its own stylesheet.",
          "The folio is a string the deck sets, not a slide number the block works out, because a section starts where you say it does.",
        ]}
      >
        <CodeBlock
          code={`<ContentsList
  items={[
    { title: "What a slide is", folio: "04" },
    { title: "Blocks", folio: "06" },
    { title: "Media", folio: "10" },
    { title: "Themes", folio: "22" },
  ]}
/>`}
          language="tsx"
        />
      </CodeSplitSlide>
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
    slug: "themes",
    title: "Themes",
    body: (
      <HeroCenteredSlide
        badge="Part two"
        title="Themes"
        description="Six stylesheets, one contract, and no component edits between them."
      />
    ),
  },
  {
    slug: "theme-contract",
    title: "The Contract",
    notes:
      "The rail is the summary and the paragraphs are the argument. If someone asks what stops a theme from drifting, the answer is the second paragraph.",
    body: (
      <ProseSlide
        eyebrow="Themes"
        label="The contract"
        paragraphs={[
          "A theme is one stylesheet scoped to the slide canvas. It sets the type scale, the frame padding, the surfaces, and the background, and it reaches the inside of a block only through the data attributes that block published.",
          "A block is free to rewrite its markup and its class names as long as the attributes stay where they are, and a theme is free to restyle anything with a name without knowing what the block does.",
          "The line a theme does not cross is content. Phosphor writes a bracketed x where a list number goes and ledger hangs a rule there instead, and neither puts a word on the slide.",
        ]}
        support={[
          "Tokens are values: a size, a colour, a shadow.",
          "Parts are attributes a block names for the theme to find.",
        ]}
        title="A theme reaches what a block named"
      />
    ),
  },
  {
    slug: "theme-table",
    title: "Six Themes",
    notes:
      "The last column is what each theme puts where a list number would go, and none of it is an edit to the block. The highlighted row is the theme this deck is rendering right now. Swap it in deck/deck.ts and every slide you have seen restyles with no other edit.",
    body: (
      <OpenContentSlide eyebrow="Themes" title="Same deck, six stylesheets">
        <DataTable
          columns={[
            { label: "Theme" },
            { label: "Display face" },
            { label: "Radius", numeric: true },
            { label: "List marker" },
          ]}
          rows={[
            {
              cells: [
                "broadsheet",
                "System serif",
                "2",
                "A small-caps numeral",
              ],
            },
            { cells: ["ledger", "Source Serif 4", "0", "A hanging rule"] },
            {
              cells: ["meridian", "Schibsted Grotesk", "10", "An accent dot"],
            },
            { cells: ["nexus", "Orbitron", "2", "A mono numeral"] },
            { cells: ["phosphor", "JetBrains Mono", "0", "[x]"] },
            {
              cells: ["deckard", "Geist", "12", "01, 02, 03"],
              highlight: true,
            },
          ]}
        />
      </OpenContentSlide>
    ),
  },
  {
    slug: "quote",
    title: "Quote",
    notes:
      "Let the quote sit before you read the attribution. This is the reaction the project was built for.",
    body: (
      <QuoteSlide
        attribution="Priya Raman"
        quote="We rebuilt the same title slide in three different tools last year. This time the title slide is a component and the talk is a text file."
        source="Staff engineer, platform"
      />
    ),
  },
  {
    slug: "shipping",
    title: "Shipping",
    body: <MinimalBreakerSlide title="Checking a deck before you present it" />,
  },
  {
    slug: "roadmap",
    title: "Roadmap",
    notes:
      "Three shipped, one not. The last marker is the unfilled one, so do not oversell it.",
    body: (
      <OpenContentSlide
        eyebrow="Roadmap"
        title="Where the project is"
        description="Filled markers have shipped."
      >
        <Timeline
          items={[
            {
              date: "Nov 2025",
              detail:
                "A fixed 1920 by 1080 stage, one route per slide, and an overflow outline in development.",
              done: true,
              label: "Canvas and routes",
            },
            {
              date: "Jan 2026",
              detail:
                "The layouts the source templates ship, installed into your app as source you own and edit.",
              done: true,
              label: "Block catalogue",
            },
            {
              date: "Mar 2026",
              detail:
                "Tokens and part attributes frozen, so a theme swap needs no edit to a single block.",
              done: true,
              label: "Theme contract",
            },
            {
              date: "Jun 2026",
              detail:
                "Publish a finished deck as a package another repository can import and re-theme.",
              label: "Deck packages",
            },
          ]}
        />
      </OpenContentSlide>
    ),
  },
  {
    slug: "checks",
    title: "The Checks",
    notes:
      "This is a session, trimmed. Point at the failure in the middle: check-overflow found a clipped slide at one theme in one colour mode.",
    body: (
      <FocusSlide kicker="A ten minute pass before a talk">
        <LogList
          items={[
            {
              message: "deckard validate: deck, theme and registry all resolve",
              status: "pass",
              time: "09:14:02",
              tone: "ok",
            },
            {
              message:
                "deckard check-overflow: ledger dark, slide 18 clipped by 34px",
              status: "fail",
              time: "09:14:09",
              tone: "alert",
            },
            {
              message: "cut the third paragraph on slide 18",
              status: "edit",
              time: "09:16:41",
              tone: "note",
            },
            {
              message:
                "deckard check-overflow: every slide fits at every theme",
              status: "pass",
              time: "09:16:58",
              tone: "ok",
            },
            {
              message: "deckard export pdf: out/deck.pdf, one page per slide",
              status: "done",
              time: "09:17:20",
              tone: "ok",
            },
          ]}
        />
      </FocusSlide>
    ),
  },
  {
    slug: "start",
    title: "Start",
    notes:
      "Give them the one command and stop talking. The rail is there so nobody has to write anything down.",
    body: (
      <HeroSplitSlide
        eyebrow="Start"
        title="Take the blocks and delete the rest of it"
        description="The blocks install as source in your app. Change them, rename them, throw half of them away."
        rail={[
          { detail: "npx shadcn@latest add deckard", term: "Install" },
          { detail: "deckard.thebuilder.dk", term: "Docs" },
          { detail: "github.com/thebuilder/deckard", term: "Source" },
        ]}
      />
    ),
    background: "accent",
  },
]
