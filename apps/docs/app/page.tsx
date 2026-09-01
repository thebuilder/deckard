import Link from "next/link"

export default function OverviewPage() {
  return (
    <>
      <h1 className="text-4xl">Deckard</h1>
      <p className="text-xl">
        Beautiful React presentations with shadcn-native theming.
      </p>
      <p>
        Every slide is a React component rendered on a fixed 1920x1080 canvas.
        Put a chart, a live demo, or a form on a slide the same way you put a
        bullet list on one. The canvas scales to the window, so a laptop, a
        projector, a phone, and the PDF export all show the same layout at
        different sizes.
      </p>
      <p>
        Slides read your shadcn tokens, so a deck inherits the app theme it
        lives next to. The deck theme is one stylesheet scoped to the canvas
        class. Change what a background variant looks like there and every slide
        follows.
      </p>

      <h2 className="pt-4 text-2xl">What is in the box</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li>A route per slide, at /slides/[id]</li>
        <li>Keyboard navigation and a Cmd/Ctrl+K jump list</li>
        <li>Step reveals through stepCount and SlideStep</li>
        <li>
          A presenter window that syncs over BroadcastChannel, with notes, a
          timer, and a next-step preview
        </li>
        <li>Light and dark color modes, per deck theme</li>
        <li>PDF export at the deck canvas size</li>
      </ul>

      <h2 className="pt-4 text-2xl">How you use it</h2>
      <pre>
        <code>{"npx @deckard/cli init my-talk\ncd my-talk\nnpm run dev"}</code>
      </pre>
      <p>
        A presentation is a Next.js app you own, with <code>app/</code>,{" "}
        <code>deck/</code>, <code>public/</code>, and <code>package.json</code>.{" "}
        <code>@deckard/core</code> is a dependency in it and holds the deck
        contract and the slideshow runtime, compiled. <code>@deckard/cli</code>{" "}
        is the <code>deckard</code> binary that generated the app and then
        checks it, screenshots it, and exports it.
      </p>
      <p>
        The theme and the slide blocks are deliberately not in the package. They
        are source files in your app from the first commit, so a measure that
        reads badly at your font is a line you edit rather than a prop you wait
        for.
      </p>
      <p>
        Neither package is on npm yet, so that <code>npx</code> line does not
        work from a clean machine. Today you point the init at packed tarballs,
        or build your deck inside the Deckard workspace.{" "}
        <Link href="/getting-started">Getting started</Link> has both, and says
        which parts change once they publish.
      </p>

      <h2 className="pt-4 text-2xl">The repository behind it</h2>
      <p>
        The Deckard repository is where the framework gets built, not where you
        write your talk. It is a pnpm workspace holding{" "}
        <code>packages/core</code> and <code>packages/cli</code> plus three
        apps. <code>apps/playground</code> is the reference deck the visual
        checks run against. <code>apps/demo</code> is a 19-slide talk shaped
        like a consumer app. <code>apps/docs</code> is this site. Slides added
        to the playground exercise the framework and ship to nobody.
      </p>
      <p>
        <Link href="/getting-started">Getting started</Link> covers the install
        and the first slide. <Link href="/authoring">Authoring rules</Link>{" "}
        covers what belongs on a slide and what breaks one.{" "}
        <Link href="/registry">Registry</Link> covers the themes and blocks you
        install into your app.
      </p>
    </>
  )
}
