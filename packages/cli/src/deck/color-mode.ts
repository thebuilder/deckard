import type { ColorMode } from "../output.ts"

// next-themes reads its stored choice before paint and prefers it, then the
// deck theme's own default, over the operating system preference the browser
// context carries. Seeding the store is what makes --light mean light for a
// theme that defaults to dark.
export const colorModeStorageKey = "theme"

const colorModes: ColorMode[] = ["dark", "light"]

export function appliedColorMode(classNames: string[]): ColorMode | undefined {
  return colorModes.find((mode) => classNames.includes(mode))
}

// The capture is only worth what its color mode claims, so a run that rendered
// the other mode stops here instead of writing a mislabelled PNG or PDF.
export function assertColorMode(
  classNames: string[],
  requested: ColorMode,
  id: string
): void {
  const applied = appliedColorMode(classNames)

  if (applied === requested) {
    return
  }

  throw new Error(
    `/slides/${id} rendered in ${applied ?? "no"} color mode after ${requested} was requested, so this run would report a mode the deck never rendered. Check that the deck layout still wraps the app in ColorModeProvider.`
  )
}
