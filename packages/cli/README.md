# @thebuilder/deckard-cli

The `deckard` command line for [Deckard](https://deckard.thebuilder.dk), a React presentation framework for Next.js. Scaffold a deck, check it, screenshot it, export it.

## Start a deck

```bash
npx @thebuilder/deckard-cli init my-talk
cd my-talk
npm run dev
```

`init` writes a Next.js app with a sample deck in it, installs it with whichever package manager ran it, makes the first commit, and typechecks the result. It asks no questions. `--theme <name>` picks any built-in, `--empty` skips the sample deck, `--no-install` and `--no-git` do what they say.

## Commands

Every command treats the current directory as the deck.

| Command | What it does |
| --- | --- |
| `deckard init <dir>` | Write a new deck |
| `deckard validate` | The deck resolves, the theme is coherent, registry paths exist |
| `deckard doctor` | Node, package resolution, the stylesheet import, the deck, the routes |
| `deckard check-overflow` | Exits 1 naming any slide the canvas clips |
| `deckard screenshots` | One PNG per slide at canvas size |
| `deckard contact-sheet` | Every slide in one grid image |
| `deckard export pdf` | One page per slide at canvas size |
| `deckard add <item>` | Install a block or switch to a built-in theme |
| `deckard eject theme` | Copy the theme's source into the deck |

`validate` and `check-overflow` exit non-zero and name the slide, so an agent can run them and act on the output.

## Documentation

- [Quickstart](https://deckard.thebuilder.dk/quickstart)
- [CLI reference](https://deckard.thebuilder.dk/reference/cli), every flag, default, and exit code
- [Exporting](https://deckard.thebuilder.dk/guides/exporting)

MIT licensed. Source at [github.com/thebuilder/deckard](https://github.com/thebuilder/deckard).
