import type { SlideBackgroundMode } from "@/types/slides"

// A hook, not a look. The deck theme decides what each variant paints.
export function SlideBackground({
  variant = "default",
}: {
  variant?: SlideBackgroundMode
}) {
  if (variant === "none") {
    return null
  }

  return (
    <div
      aria-hidden="true"
      className="slide-background"
      data-slide-background={variant}
    />
  )
}
