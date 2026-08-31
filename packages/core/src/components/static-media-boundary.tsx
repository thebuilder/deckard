"use client"

import { usePathname } from "next/navigation"
import { type ReactNode, useEffect, useRef } from "react"

interface StaticMediaBoundaryProps {
  activePath?: string
  children: ReactNode
  className?: string
  enabled?: boolean
}

function freezeMedia(root: HTMLElement) {
  const mediaNodes = root.querySelectorAll<HTMLMediaElement>("video, audio")

  for (const media of mediaNodes) {
    media.muted = true
    media.autoplay = false
    media.pause()

    if (media instanceof HTMLVideoElement) {
      media.playsInline = true
      if (!media.hasAttribute("controls")) {
        media.controls = false
      }
    }
  }
}

export function StaticMediaBoundary({
  children,
  enabled = false,
  className,
  activePath,
}: StaticMediaBoundaryProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const root = rootRef.current

    // biome-ignore lint/suspicious/noUnnecessaryConditions: TypeScript types ref.current as nullable, so the guard is required to compile
    if (!root) {
      return
    }

    if (activePath && pathname !== activePath) {
      freezeMedia(root)
      return
    }

    if (!enabled) {
      return
    }

    freezeMedia(root)

    const observer = new MutationObserver(() => {
      freezeMedia(root)
    })

    observer.observe(root, {
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [activePath, enabled, pathname])

  useEffect(() => {
    function handleVisibilityChange() {
      if (!(document.hidden && rootRef.current)) {
        return
      }

      freezeMedia(rootRef.current)
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  return (
    <div className={className} ref={rootRef}>
      {children}
    </div>
  )
}
