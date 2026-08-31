import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { deck } from "@/deck/deck"
import { cn } from "@/lib/utils"

import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  description: deck.description,
  title: {
    default: deck.title,
    template: `%s · ${deck.title}`,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isPdfExport = process.env.NEXT_PUBLIC_PDF_EXPORT === "1"
  const isPdfDarkTheme = process.env.NEXT_PUBLIC_PDF_THEME === "dark"

  return (
    <html
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable,
        isPdfExport && isPdfDarkTheme && "dark"
      )}
      data-pdf-export={isPdfExport ? "true" : undefined}
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
