import fs from "node:fs"
import path from "node:path"

import { projectRoot } from "./paths.ts"

export interface ScreenshotEntry {
  file: string
  id: string
  number: number
  title: string
}

export interface ScreenshotManifest {
  canvas: { height: number; width: number }
  colorMode: string
  slides: ScreenshotEntry[]
}

export const screenshotDirectory = path.resolve(projectRoot, "out/screenshots")

const manifestPath = path.join(screenshotDirectory, "manifest.json")

export function writeManifest(manifest: ScreenshotManifest): void {
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
}

export function readManifest(): ScreenshotManifest {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      `No screenshots at ${screenshotDirectory}. Run: pnpm deck:screenshots`
    )
  }

  return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as ScreenshotManifest
}

export function resetScreenshotDirectory(): void {
  fs.rmSync(screenshotDirectory, { force: true, recursive: true })
  fs.mkdirSync(screenshotDirectory, { recursive: true })
}
