"use client"

import type { VideoHTMLAttributes } from "react"

import { useIsPresenterPreview } from "@/components/slideshow/slide-context"

type SlideMediaVideoProps = VideoHTMLAttributes<HTMLVideoElement> & {
  autoplay?: boolean
}

export function SlideMediaVideo({
  autoplay = false,
  muted,
  loop,
  controls,
  ...props
}: SlideMediaVideoProps) {
  const isPresenterPreview = useIsPresenterPreview()
  const shouldAutoplay = autoplay && !isPresenterPreview

  return (
    <video
      {...props}
      autoPlay={shouldAutoplay}
      controls={controls ?? !shouldAutoplay}
      loop={shouldAutoplay ? (loop ?? true) : loop}
      muted={shouldAutoplay ? (muted ?? true) : muted}
    />
  )
}
