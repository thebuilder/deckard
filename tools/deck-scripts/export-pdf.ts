#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import process from "node:process"

import { PDFDocument } from "pdf-lib"

import { type ColorMode, fail, readNumberFlag, write } from "./lib/cli.ts"
import { projectRoot } from "./lib/paths.ts"
import {
  type CanvasSession,
  openSlide,
  pdfProfile,
  withCanvasSession,
} from "./lib/preview.ts"

const outputPath = path.resolve(
  projectRoot,
  process.env.PDF_EXPORT_OUTPUT ?? "out/slides.pdf"
)

// A handout prints light unless you ask for the dark deck.
const colorMode: ColorMode = process.argv.includes("--dark") ? "dark" : "light"
const port = readNumberFlag(
  process.argv,
  "port",
  Number(process.env.PDF_EXPORT_PORT ?? 3410)
)
const skipBuild = process.argv.includes("--skip-build")

function pxToPt(px: number): number {
  return (px * 72) / 96
}

async function exportPdf({ baseUrl, canvas, ids, page }: CanvasSession) {
  const pdf = await PDFDocument.create()

  for (const id of ids) {
    // biome-ignore lint/performance/noAwaitInLoops: slides are captured one at a time on a single page
    await openSlide(page, baseUrl, id)

    const imageBuffer = await page.locator("[data-slide-canvas]").screenshot({
      animations: "disabled",
      type: "png",
    })

    const image = await pdf.embedPng(imageBuffer)
    const pdfWidth = pxToPt(canvas.width)
    const pdfHeight = pxToPt(canvas.height)
    const pdfPage = pdf.addPage([pdfWidth, pdfHeight])

    pdfPage.drawImage(image, {
      height: pdfHeight,
      width: pdfWidth,
      x: 0,
      y: 0,
    })

    write(`Exported slide: ${id}`)
  }

  const pdfBytes = await pdf.save()

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, pdfBytes)
  write(`PDF written to ${outputPath}`)
}

withCanvasSession(
  { colorMode, port, profile: pdfProfile(colorMode), skipBuild },
  exportPdf
).catch(fail)
