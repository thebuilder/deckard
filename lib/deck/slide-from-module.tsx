import type { SlideDefinition, SlideModule } from "@/lib/deck/types"

export function slideFromModule(
  slideModule: SlideModule,
  sourcePath?: string
): SlideDefinition {
  const Slide = slideModule.default
  const { order: _order, ...meta } = slideModule.meta ?? {}

  return {
    ...meta,
    body: <Slide />,
    notes: slideModule.notes ?? slideModule.meta?.notes,
    sourcePath,
  }
}
