import type { SlideBackgroundMode, SlideMotionField } from "../types/slides"
import { SlideMotionBackground } from "./slide-motion-background"

// A hook, not a look. The deck theme decides what each variant paints.
export function SlideBackground({
  field,
  frozen = false,
  variant = "default",
}: {
  /** Set when the theme paints this variant in a canvas rather than in CSS. */
  field?: SlideMotionField
  frozen?: boolean
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
    >
      {field ? <SlideMotionBackground field={field} frozen={frozen} /> : null}
    </div>
  )
}
