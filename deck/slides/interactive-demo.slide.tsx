import { OpenContentSlide } from "@/app/slides/blocks/templates"
import {
  type ChromePreset,
  ChromePresetPlayground,
} from "@/deck/slides/interactive-demo-widget"
import type { SlideMeta } from "@/lib/deck/types"

export const meta: SlideMeta = {
  background: "grid",
  slug: "interactive",
  title: "Interactive Slide",
}

export const notes = `This slide is its own module: metadata, notes, and an async Server Component in one file.

The buttons are a client component nested inside the slide. Click through the presets while you explain that only the widget ships JavaScript, the slide itself is HTML.

Point out that the preset list was awaited on the server before the slide rendered.`

const presetLoadDelayMs = 30

async function loadChromePresets(): Promise<ChromePreset[]> {
  await new Promise((resolve) => {
    setTimeout(resolve, presetLoadDelayMs)
  })

  return [
    {
      background: "default",
      footer: "counter",
      header: "auto",
      id: "talk",
      label: "Talk",
      layout: "default",
      summary:
        "The default frame. Header for branding and the command center, a slide counter at the bottom.",
    },
    {
      background: "spotlight",
      footer: "hidden",
      header: "visible",
      id: "breaker",
      label: "Breaker",
      layout: "default",
      summary:
        "For section breaks. The counter disappears so one sentence carries the slide.",
    },
    {
      background: "none",
      footer: "hidden",
      header: "hidden",
      id: "film",
      label: "Film",
      layout: "fullscreen",
      summary:
        "All chrome off and the canvas handed to the media. Use it for trailers and launch shots.",
    },
  ]
}

export default async function InteractiveDemoSlide() {
  const presets = await loadChromePresets()

  return (
    <OpenContentSlide
      description="The slide stays a Server Component. The presets below are a client component nested inside it, so only that widget ships JavaScript."
      eyebrow="Interactive"
      title="Put the interactivity one level down"
    >
      <ChromePresetPlayground presets={presets} />
    </OpenContentSlide>
  )
}
