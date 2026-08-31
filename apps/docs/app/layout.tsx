import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"

import "./globals.css"

export const metadata: Metadata = {
  description: "Beautiful React presentations with shadcn-native theming.",
  title: {
    default: "Deckard",
    template: "%s · Deckard",
  },
}

const links = [
  { href: "/", label: "Overview" },
  { href: "/getting-started", label: "Getting started" },
  { href: "/authoring", label: "Authoring rules" },
  { href: "/registry", label: "Registry" },
]

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="mx-auto max-w-3xl px-6 py-12 leading-relaxed">
        <header className="mb-12 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <Link className="font-semibold text-lg no-underline" href="/">
            Deckard
          </Link>
          <nav className="flex gap-4 text-sm">
            {links.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="space-y-6">{children}</main>
      </body>
    </html>
  )
}
