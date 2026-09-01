import { ColorModeProvider } from "@deckard/core/components"
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { deck } from "../deck/deck"

import "./globals.css"

export const metadata: Metadata = {
  description: deck.description,
  title: deck.title,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-svh bg-background text-foreground antialiased">
        <ColorModeProvider theme={deck.theme}>{children}</ColorModeProvider>
      </body>
    </html>
  )
}
