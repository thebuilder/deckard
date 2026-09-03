# @deckard/themes

The built-in themes for [Deckard](https://deckard.thebuilder.dk), a React presentation framework for Next.js. Each export is a `SlideTheme` that carries its own stylesheet and fonts, so importing it is the whole install.

## Use a theme

```ts
// deck/deck.ts
import { defineDeck } from "@deckard/core"
import { phosphor } from "@deckard/themes"

export const deck = defineDeck({
  theme: phosphor,
  // ...
})
```

Every theme is on the [theme gallery](https://deckard.thebuilder.dk/themes), in light and dark, painted by its own stylesheet.

## Make it yours

```bash
deckard eject theme
```

That copies the theme's source into `deck/theme/` and repoints `deck/deck.ts` at the copy. From then on the stylesheet and the `THEME.md` beside it are yours to edit. `deckard add theme <name>` switches back to a built-in.

Fonts that come with a theme are SIL Open Font License 1.1, subset and self-hosted inside the package. A deck loads only the theme it uses and calls no font host.

## Documentation

- [Themes guide](https://deckard.thebuilder.dk/guides/themes)
- [Token reference](https://deckard.thebuilder.dk/reference/tokens)

Requires `@deckard/core`. MIT licensed. Source at [github.com/thebuilder/deckard](https://github.com/thebuilder/deckard).
