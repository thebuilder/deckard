import type { SlideMeta } from "@deckard/core"
import { OpenContentSlide } from "@/app/slides/blocks/templates"
import { canvas } from "@/deck/canvas"
import {
  CanvasScaleCalculator,
  type Screen,
} from "@/deck/slides/canvas-scale-widget"

export const meta: SlideMeta = {
  slug: "scale",
  title: "Contain fit",
}

export const notes = `Click through the screens rather than reading the numbers out. The ultrawide one is the one that lands: 3440 by 1440 gives you letterbox bars on the sides, not a wider slide.

Then point at the type readout. A 24 pixel heading on the laptop preset is under 18 real pixels, which is why the theme sizes look enormous when you edit them and correct when you present them.

The whole widget is one min() call. Say that out loud, it is the entire fitting model.`

const screens: Screen[] = [
  { height: 900, id: "laptop", label: "Laptop 1440x900", width: 1440 },
  { height: 1080, id: "projector", label: "Projector 1920x1080", width: 1920 },
  { height: 1440, id: "ultrawide", label: "Ultrawide 3440x1440", width: 3440 },
  { height: 768, id: "tablet", label: "Tablet 1024x768", width: 1024 },
  { height: 844, id: "phone", label: "Phone 390x844", width: 390 },
]

export default function ScaleSlide() {
  return (
    <OpenContentSlide
      description="The canvas never reflows. It multiplies. Every number here comes from one min() over the window, which is the whole of contain fit."
      eyebrow="Contain fit"
      title="Pick a screen, watch the multiplier"
    >
      <CanvasScaleCalculator
        canvasHeight={canvas.height}
        canvasWidth={canvas.width}
        screens={screens}
      />
    </OpenContentSlide>
  )
}
