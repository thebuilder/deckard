import { isPdfExport, pdfExportColorMode } from "@deckard/core"
import { ColorModeProvider } from "@deckard/core/components"
import { cn } from "@deckard/core/utils"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import { deck } from "@/deck/deck"

import "./globals.css"

export const metadata: Metadata = {
  description: deck.description,
  title: {
    default: deck.title,
    template: `%s · ${deck.title}`,
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const pdfColorMode = pdfExportColorMode()

  return (
    <html
      className={cn(pdfColorMode)}
      data-pdf-export={isPdfExport() ? "true" : undefined}
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <ColorModeProvider forcedColorMode={pdfColorMode} theme={deck.theme}>
          {children}
        </ColorModeProvider>
      </body>
    </html>
  )
}
