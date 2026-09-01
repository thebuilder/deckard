import type { Deck } from "@deckard/core"
import type { Plugin } from "vite"
import { createServer } from "vite"

import { projectRoot } from "./paths.ts"

const serverOnlyStubId = "\0deckard-server-only"
const appAliasPattern = /^@\//

// server-only throws outside a react-server condition, and the deck imports it to keep the array off the client.
function stubServerOnly(): Plugin {
  return {
    enforce: "pre",
    load(id) {
      return id === serverOnlyStubId ? "export {}" : undefined
    },
    name: "deckard-stub-server-only",
    resolveId(id) {
      return id === "server-only" ? serverOnlyStubId : undefined
    },
  }
}

// The deck array is TSX with an import.meta.glob, a path alias, and asset imports, so node cannot import it on its own. A throwaway Vite server can, in under a second, without a Next build.
export async function loadDeck(): Promise<Deck> {
  const server = await createServer({
    appType: "custom",
    configFile: false,
    logLevel: "silent",
    optimizeDeps: { noDiscovery: true },
    plugins: [stubServerOnly()],
    resolve: {
      alias: [{ find: appAliasPattern, replacement: `${projectRoot}/` }],
    },
    root: projectRoot,
    server: { hmr: false, middlewareMode: true, watch: null },
    ssr: { noExternal: ["@deckard/core", "server-only"] },
  })

  try {
    const loaded = (await server.ssrLoadModule("/deck/deck.ts")) as {
      deck?: Deck
    }

    if (!loaded.deck) {
      throw new Error(
        "deck/deck.ts has to export `deck` from defineDeck. Nothing named deck came back."
      )
    }

    return loaded.deck
  } finally {
    await server.close()
  }
}
