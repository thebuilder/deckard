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

      <h2 className="pt-4 text-2xl">Packages</h2>
      <p>
        <code>@deckard/core</code> holds the deck contract and the slideshow
        runtime. It ships as TypeScript source and your Next.js app transpiles
        it. The deck you write, its theme, and its blocks stay in your app.
      </p>
      <p>
        <Link href="/getting-started">Getting started</Link> covers the install
        and the first slide. <Link href="/authoring">Authoring rules</Link>{" "}
        covers what belongs on a slide and what breaks one.
      </p>
    </>
  )
}
