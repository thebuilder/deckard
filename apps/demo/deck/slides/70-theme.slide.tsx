import type { SlideMeta } from "@deckard/core"
import { BulletList } from "@/app/slides/blocks/collections"
import { OpenContentSlide } from "@/app/slides/blocks/templates"

export const meta: SlideMeta = {
  background: "grid",
  title: "The theme",
}

export const notes = `Point at the ruled background while you say the last bullet. That is the grid variant, painted by this deck's stylesheet, and no component knows it exists.

The honest part is bullet three. This theme is a fork of the broadsheet theme, which means every fix upstream is a fix I do not get. That is the price of owning the file, and it is worth naming rather than glossing.

If someone asks what a theme cannot do: it cannot change the layout. Blocks own structure, the theme owns everything you can see.`

export default function ThemeSlide() {
  return (
    <OpenContentSlide
      description="A theme is three files in your repository, not a config object you configure around."
      eyebrow="Theme"
      title="You own the stylesheet"
    >
      <BulletList
        items={[
          <>
            <code>theme.css</code> holds every audience-facing color, size, and
            background, scoped to one class that the canvas carries and nothing
            else does.
          </>,
          <>
            That scope is the point. The command center and the presenter
            console keep the app tokens, so they stay readable whatever the deck
            looks like.
          </>,
          <>
            This deck installed the broadsheet theme and then changed the
            accent, the type scale, the body face, and the spotlight background.
            None of that needed a change upstream, and none of it arrives from
            upstream either.
          </>,
          <>
            <code>SlideBackground</code> renders one empty div with a data
            attribute. What each variant paints is a stylesheet decision, never
            a component edit.
          </>,
        ]}
      />
    </OpenContentSlide>
  )
}
