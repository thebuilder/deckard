import type { SlideDefinition, SlideModule } from "@/lib/deck/types"

export function slideFromModule(
  slideModule: SlideModule,
  sourcePath?: string
): SlideDefinition {
  const Slide = slideModule.default

  return {
    ...slideModule.meta,
    body: <Slide />,
    notes: slideModule.notes ?? slideModule.meta?.notes,
    sourcePath,
  }
}
