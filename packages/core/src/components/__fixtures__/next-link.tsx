import type { AnchorHTMLAttributes } from "react"

// next/link and next/navigation both want an app around them. The browser tests
// mount components on their own, so vitest.config.ts points those imports here.
export default function Link(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} />
}
