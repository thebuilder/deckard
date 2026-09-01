import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Authoring rules",
}

export default function AuthoringPage() {
  return (
    <>
      <h1 className="text-3xl">Authoring rules</h1>
      <p>
        These are the rules the framework enforces, plus the ones that keep a
        deck maintainable. The first group has tests and build errors behind it.
        The rest is convention.
      </p>
      <p>
        They apply to every deck: the one in your own app, and the two in the
        Deckard repository. <code>deck/slides.tsx</code> below means your
        app&apos;s deck directory, not a shared file somewhere in the framework.
      </p>

      <h2 className="pt-4 text-2xl">The canvas is one fixed size</h2>
      <p>
        Size slide content against the canvas with <code>h-full</code>,
        percentages, and fixed values. Browser viewport units (<code>svh</code>,{" "}
        <code>vw</code>) and responsive breakpoints (<code>sm:</code>,{" "}
        <code>lg:</code>) react to the window, and the window is not the slide.
        Inside the canvas they are always the wrong size.
      </p>
      <p>
        What does not fit gets clipped. In development an overflowing slide logs
        a warning and draws an amber outline, and{" "}
        <code>pnpm deck:check-overflow</code> fails on it with the slide id and
        how far over it runs. Trim it, or put the part that has to scroll in{" "}
        <code>SlideScrollArea</code>, which keeps wheel, touch, and key
        scrolling inside itself so scrolling never steps the deck.
      </p>

      <h2 className="pt-4 text-2xl">Slide modules stay on the server</h2>
      <p>
        Slide entry modules are Server Components. Never put{" "}
        <code>&quot;use client&quot;</code> at the top of the deck array or a{" "}
        <code>*.slide.tsx</code> file. A test scans those files and fails on it.
      </p>
      <p>
        Interactivity goes one level down, in a nested client component the
        slide renders. Data fetching goes inline: <code>await</code> inside the
        slide component, and the route renders the slide once the data resolves.
      </p>
      <p>
        A discovered module has to be synchronous. Top-level await or a
        WebAssembly dependency anywhere in its imports turns it into an async
        module, the eager glob hands back a promise instead of the exports, and
        discovery throws with the file path. That is why <code>CodeBlock</code>{" "}
        ships from its own entry point, <code>@deckard/core/code-block</code>:
        shiki loads a WebAssembly regex engine, so a slide that shows
        highlighted code belongs in the deck array rather than in a discovered
        file.
      </p>

      <h2 className="pt-4 text-2xl">Only serializable props cross</h2>
      <p>
        Anything passed into a client component has to serialize. Pass a{" "}
        <code>SlideSummary</code> built from a resolved slide, and let the
        rendered body cross as <code>children</code>.
      </p>

      <h2 className="pt-4 text-2xl">Tokens, not colors</h2>
      <p>
        Inside the canvas, style with semantic tokens (<code>bg-card</code>,{" "}
        <code>text-muted-foreground</code>, <code>border-border</code>) or slide
        tokens (<code>--slide-title-size</code>, <code>--slide-surface</code>,{" "}
        <code>--slide-radius</code>). Never a hardcoded color, and never a raw
        font size where a token exists.
      </p>
      <p>
        Outside the canvas, in the utility bar, command center, presenter
        console, and dialogs, keep the app tokens. Those have to stay readable
        whatever the deck theme does.
      </p>
      <p>
        <code>SlideBackground</code> renders one empty element carrying{" "}
        <code>data-slide-background</code>. It is a hook, not a look. Changing
        how the <code>spotlight</code> or <code>grid</code> variant looks is a
        theme stylesheet edit, not a component edit.
      </p>

      <h2 className="pt-4 text-2xl">Composition over flags</h2>
      <p>
        Prefer an explicit variant component over a mode boolean.{" "}
        <code>ContentSlideCard</code> and <code>OpenContentSlide</code> beat one
        component with a <code>variant</code> prop and three branches inside it.
        Use slide metadata (<code>layout</code>, <code>header</code>,{" "}
        <code>footer</code>, <code>background</code>, <code>stepCount</code>)
        instead of route-specific special cases.
      </p>

      <h2 className="pt-4 text-2xl">Check the change</h2>
      <p>
        Structural edits get <code>pnpm deck:validate</code>: a new slug, a
        slide moved into its own file, a theme token, a registry path. Content
        edits get <code>pnpm deck:check-overflow</code>. Before you call a deck
        done, look at a fresh <code>pnpm deck:contact-sheet</code>, because a
        whole deck in one grid catches what reading the diff does not.{" "}
        <Link href="/getting-started">Getting started</Link> describes what each
        one measures. Every one of them is a <code>deckard</code> subcommand;
        the <code>pnpm</code> names are the scripts <code>deckard init</code>{" "}
        writes into your <code>package.json</code>.
      </p>

      <h2 className="pt-4 text-2xl">Two things that will confuse you</h2>
      <p>
        Adding or deleting a <code>*.slide.tsx</code> file while{" "}
        <code>next dev</code> is running leaves page routes serving stale
        modules. Restart the dev server.
      </p>
      <p>
        A slide that throws under <code>next dev</code> renders an inline error
        card and navigation keeps working. In a production build a Server
        Component that throws is fatal to the route, and Next serves its own
        error page instead.
      </p>
    </>
  )
}
