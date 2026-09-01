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
  const isPdfExport = process.env.NEXT_PUBLIC_PDF_EXPORT === "1"
  const isPdfDarkTheme = process.env.NEXT_PUBLIC_PDF_THEME === "dark"

  return (
    <html
      className={cn(isPdfExport && isPdfDarkTheme && "dark")}
      data-pdf-export={isPdfExport ? "true" : undefined}
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <ColorModeProvider theme={deck.theme}>{children}</ColorModeProvider>
      </body>
    </html>
  )
}
