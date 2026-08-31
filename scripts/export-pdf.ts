#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

import { PDFDocument } from "pdf-lib"
import type { Browser, Page } from "playwright"
import { chromium } from "playwright"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, "..")

const port = Number(process.env.PDF_EXPORT_PORT ?? 3410)
const outputPath = path.resolve(
  projectRoot,
  process.env.PDF_EXPORT_OUTPUT ?? "out/slides.pdf"
)
const skipBuild = process.argv.includes("--skip-build")
const darkMode = process.argv.includes("--dark")
const pdfTheme = darkMode ? "dark" : "light"

function runBuild(): void {
  if (skipBuild) {
    return
  }

  const result = spawnSync("pnpm", ["build"], {
    cwd: projectRoot,
    env: {
      ...process.env,
      NEXT_PUBLIC_PDF_EXPORT: "1",
      NEXT_PUBLIC_PDF_THEME: pdfTheme,
    },
    stdio: "inherit",
  })

  if (result.status !== 0) {
    throw new Error("Build failed")
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForServer(baseUrl: string): Promise<void> {
  const timeoutMs = 60_000
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    try {
      // biome-ignore lint/performance/noAwaitInLoops: polling the dev server has to be sequential
      const response = await fetch(baseUrl)
      if (response.ok) {
        return
      }
    } catch {
      // server not ready yet
    }

    await sleep(500)
  }

  throw new Error(`Timed out waiting for server at ${baseUrl}`)
}

async function readSlideIdsFromSitemap(baseUrl: string): Promise<string[]> {
  const sitemapUrl = `${baseUrl}/sitemap.xml`
  const response = await fetch(sitemapUrl)

  if (!response.ok) {
    throw new Error(`Failed to load sitemap at ${sitemapUrl}`)
  }

  const xml = await response.text()
  const locMatches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]

  const ids = locMatches
    .map((match) => match[1]?.trim() ?? "")
    .map((loc) => {
      try {
        return new URL(loc).pathname
      } catch {
        return ""
      }
    })
    .filter((pathname) => pathname.startsWith("/slides/"))
    .map((pathname) => decodeURIComponent(pathname.replace("/slides/", "")))
    .filter((id) => id.length > 0)

  if (ids.length === 0) {
    throw new Error(
      "No slide routes found in sitemap. Ensure app/sitemap.ts includes /slides/* entries."
    )
  }

  return [...new Set(ids)]
}

function pxToPt(px: number): number {
  return (px * 72) / 96
}

interface CanvasGeometry {
  height: number
  margin: number
  width: number
}

// Page size comes from the deck canvas the route renders, so export and presentation can never drift apart.
async function readCanvasGeometry(page: Page): Promise<CanvasGeometry> {
  const geometry = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLElement>("[data-slide-canvas]")
    const viewport = document.querySelector<HTMLElement>(
      "[data-slide-viewport]"
    )

    if (!(canvas && viewport)) {
      return null
    }

    return {
      height: Number(canvas.dataset.canvasHeight),
      margin: Number(viewport.dataset.canvasMargin),
      width: Number(canvas.dataset.canvasWidth),
    }
  })

  const isUsable =
    geometry &&
    Number.isFinite(geometry.width) &&
    Number.isFinite(geometry.height) &&
    Number.isFinite(geometry.margin) &&
    geometry.width > 0 &&
    geometry.height > 0

  if (!isUsable) {
    throw new Error(
      "Could not read the deck canvas size from the slide route. Check that SlideShell still renders SlideViewport and SlideCanvas."
    )
  }

  return geometry
}

async function exportPdf({
  ids,
  baseUrl,
}: {
  ids: string[]
  baseUrl: string
}): Promise<void> {
  let browser: Browser
  try {
    browser = await chromium.launch({ headless: true })
  } catch (error) {
    throw new Error(
      "Failed to launch Chromium for PDF export. Run: pnpm exec playwright install chromium",
      { cause: error }
    )
  }

  try {
    const context = await browser.newContext({
      colorScheme: pdfTheme === "dark" ? "dark" : "light",
      viewport: { height: 1080, width: 1920 },
    })

    const page = await context.newPage()
    const pdf = await PDFDocument.create()

    await page.goto(`${baseUrl}/slides/${ids[0]}`, { waitUntil: "networkidle" })

    const canvas = await readCanvasGeometry(page)
    const gutter = canvas.margin * 2

    // A viewport of exactly canvas plus gutter renders the canvas at scale 1, so the shot is one logical pixel per image pixel.
    await page.setViewportSize({
      height: canvas.height + gutter,
      width: canvas.width + gutter,
    })

    for (const id of ids) {
      const url = `${baseUrl}/slides/${id}`
      // biome-ignore lint/performance/noAwaitInLoops: slides are captured one at a time on a single page
      await page.goto(url, { waitUntil: "networkidle" })
      await page.waitForTimeout(80)

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

      process.stdout.write(`Exported slide: ${id}\n`)
    }

    const pdfBytes = await pdf.save()
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, pdfBytes)
    process.stdout.write(`PDF written to ${outputPath}\n`)

    await context.close()
  } finally {
    await browser.close()
  }
}

async function main(): Promise<void> {
  runBuild()

  const baseUrl = `http://127.0.0.1:${port}`
  const server = spawn("pnpm", ["start", "-p", String(port)], {
    cwd: projectRoot,
    env: {
      ...process.env,
      NEXT_PUBLIC_PDF_EXPORT: "1",
      NEXT_PUBLIC_PDF_THEME: pdfTheme,
      NODE_ENV: "production",
    },
    stdio: "inherit",
  })

  const shutdown = () => {
    if (!server.killed) {
      server.kill("SIGTERM")
    }
  }

  process.on("SIGINT", shutdown)
  process.on("SIGTERM", shutdown)

  try {
    await waitForServer(baseUrl)
    const ids = await readSlideIdsFromSitemap(baseUrl)
    await exportPdf({ baseUrl, ids })
  } finally {
    shutdown()
  }
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`
  )
  process.exit(1)
})
