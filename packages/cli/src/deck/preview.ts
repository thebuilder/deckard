import { spawn, spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import process from "node:process"

import type { Browser, BrowserContext, Page } from "playwright"
import { chromium } from "playwright"
import type { ColorMode } from "../output.ts"
import { write } from "../output.ts"
import { deckPackageManager, execCommand } from "../package-manager.ts"
import { projectRoot, resolveFromProject } from "../project.ts"
import { assertColorMode, colorModeStorageKey } from "./color-mode.ts"

// Resolved rather than assumed: in this workspace these are packages/core and
// packages/themes, and in a published deck they are whatever node_modules the
// app installed. A deck that cannot resolve core fails at the build below, with
// a better message than here, and a deck with no installed theme package
// resolves to nothing and contributes no inputs.
const corePackage = resolveFromProject("@deckard/core/package.json")
const themesPackage = resolveFromProject("@deckard/themes/package.json")

// The stylesheets are the reason the theme package is here: a retuned token
// changes every slide and nothing under app/ or deck/ moves with it.
function packageInputs(packagePath: string | null) {
  if (!packagePath) {
    return []
  }

  const directory = path.dirname(packagePath)

  return [
    packagePath,
    path.join(directory, "src"),
    path.join(directory, "dist"),
  ]
}

export interface BuildProfile {
  env: Record<string, string>
  id: string
}

export interface CanvasGeometry {
  height: number
  margin: number
  width: number
}

export interface CanvasSession {
  baseUrl: string
  canvas: CanvasGeometry
  ids: string[]
  page: Page
}

export interface SessionOptions {
  colorMode: ColorMode
  port: number
  profile: BuildProfile
  skipBuild: boolean
}

// The deck as the audience sees it: chrome visible, color mode left to the browser so one build serves both.
export const previewProfile: BuildProfile = { env: {}, id: "preview" }

// The PDF build bakes the color mode into the HTML class and hides the chrome, so it needs a build of its own.
export function pdfProfile(colorMode: ColorMode): BuildProfile {
  return {
    env: { NEXT_PUBLIC_PDF_EXPORT: "1", NEXT_PUBLIC_PDF_THEME: colorMode },
    id: `pdf-${colorMode}`,
  }
}

const buildStampPath = path.join(projectRoot, ".next", "deckard-build.json")

// The Next binary rather than the pnpm script: killing a pnpm wrapper prints a lifecycle failure over a run that succeeded.
const nextBin = path.join(projectRoot, "node_modules", ".bin", "next")

const buildInputs = [
  path.join(projectRoot, "app"),
  path.join(projectRoot, "assets"),
  path.join(projectRoot, "components"),
  path.join(projectRoot, "deck"),
  path.join(projectRoot, "hooks"),
  path.join(projectRoot, "lib"),
  path.join(projectRoot, "public"),
  path.join(projectRoot, "components.json"),
  path.join(projectRoot, "next.config.mjs"),
  path.join(projectRoot, "next.config.ts"),
  path.join(projectRoot, "package.json"),
  path.join(projectRoot, "postcss.config.mjs"),
  path.join(projectRoot, "postcss.config.ts"),
  path.join(projectRoot, "tsconfig.json"),
  ...packageInputs(corePackage),
  ...packageInputs(themesPackage),
]

function newestModification(target: string): number {
  const stats = fs.statSync(target, { throwIfNoEntry: false })

  if (!stats) {
    return 0
  }

  if (!stats.isDirectory()) {
    return stats.mtimeMs
  }

  return fs
    .readdirSync(target)
    .reduce(
      (newest, entry) =>
        Math.max(newest, newestModification(path.join(target, entry))),
      stats.mtimeMs
    )
}

function isBuildFresh(profile: BuildProfile): boolean {
  const stamp = fs.readFileSync(buildStampPath, "utf8").toString()
  const parsed = JSON.parse(stamp) as { builtAtMs?: number; id?: string }

  if (parsed.id !== profile.id || typeof parsed.builtAtMs !== "number") {
    return false
  }

  const newestInput = buildInputs.reduce(
    (newest, input) => Math.max(newest, newestModification(input)),
    0
  )

  return parsed.builtAtMs >= newestInput
}

function hasFreshBuild(profile: BuildProfile): boolean {
  try {
    return isBuildFresh(profile)
  } catch {
    return false
  }
}

function ensureBuild(profile: BuildProfile, skipBuild: boolean): void {
  if (skipBuild) {
    write("Reusing the existing build (--skip-build).")
    return
  }

  if (hasFreshBuild(profile)) {
    write(`Reusing the fresh ${profile.id} build.`)
    return
  }

  const result = spawnSync(nextBin, ["build"], {
    cwd: projectRoot,
    env: { ...process.env, ...profile.env },
    stdio: "inherit",
  })

  if (result.status !== 0) {
    throw new Error("next build failed. Fix the build, then run this again.")
  }

  fs.writeFileSync(
    buildStampPath,
    `${JSON.stringify({ builtAtMs: Date.now(), id: profile.id }, null, 2)}\n`
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

interface PreviewServer {
  hasExited: () => boolean
  stop: () => Promise<void>
}

function startNextServer(port: number, env: Record<string, string>) {
  const child = spawn(nextBin, ["start", "-p", String(port)], {
    cwd: projectRoot,
    env: { ...process.env, ...env, NODE_ENV: "production" },
    stdio: "inherit",
  })

  let hasExited = false
  const exited = new Promise<void>((resolve) => {
    child.on("exit", () => {
      hasExited = true
      resolve()
    })
  })

  const server: PreviewServer = {
    hasExited: () => hasExited,
    stop: async () => {
      if (!hasExited) {
        child.kill("SIGTERM")
      }

      await exited
    },
  }

  // Once: a second Ctrl+C has nothing left to do, and the parent has to leave
  // with the child rather than swallow the signal and outlive the server.
  process.once("SIGINT", () => {
    child.kill("SIGTERM")
    setTimeout(() => process.exit(130), 500)
  })

  return server
}

// Without this, a busy port hands the run to whatever else is answering there and the results describe the wrong app.
async function assertPortIsFree(baseUrl: string): Promise<void> {
  try {
    await fetch(baseUrl, { signal: AbortSignal.timeout(2000) })
  } catch {
    return
  }

  throw new Error(
    `Something is already serving ${baseUrl}. Stop it, or pass --port=<free port>.`
  )
}

async function isServing(baseUrl: string): Promise<boolean> {
  try {
    return (await fetch(baseUrl)).ok
  } catch {
    return false
  }
}

async function waitForServer(
  baseUrl: string,
  server: PreviewServer
): Promise<void> {
  const timeoutMs = 60_000
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    if (server.hasExited()) {
      throw new Error(
        `The preview server exited before it was ready. Check the output above, and whether ${baseUrl} is already taken.`
      )
    }

    // biome-ignore lint/performance/noAwaitInLoops: polling the server has to be sequential
    if (await isServing(baseUrl)) {
      return
    }

    await sleep(500)
  }

  throw new Error(`Timed out waiting for the server at ${baseUrl}.`)
}

async function readSlideIds(baseUrl: string): Promise<string[]> {
  const sitemapUrl = `${baseUrl}/sitemap.xml`
  const response = await fetch(sitemapUrl)

  if (!response.ok) {
    throw new Error(`Failed to load the sitemap at ${sitemapUrl}.`)
  }

  const xml = await response.text()
  const ids = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
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
      "No slide routes in the sitemap. Check that app/sitemap.ts still lists /slides/* entries."
    )
  }

  return [...new Set(ids)]
}

function isPositive(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

// Geometry comes from the canvas the route renders, so tooling can never drift from the presentation.
async function readCanvasGeometry(page: Page): Promise<CanvasGeometry> {
  const geometry = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLElement>("[data-slide-canvas]")
    const viewport = document.querySelector<HTMLElement>(
      "[data-slide-viewport]"
    )

    return {
      height: Number(canvas?.dataset.canvasHeight),
      margin: Number(viewport?.dataset.canvasMargin),
      width: Number(canvas?.dataset.canvasWidth),
    }
  })

  const isUsable =
    [geometry.width, geometry.height].every(isPositive) && geometry.margin >= 0

  if (!isUsable) {
    throw new Error(
      "Could not read the deck canvas size from the slide route. Check that SlideShell still renders SlideViewport and SlideCanvas."
    )
  }

  return geometry
}

export async function launchBrowser(): Promise<Browser> {
  try {
    return await chromium.launch({ headless: true })
  } catch (error) {
    throw new Error(
      `Failed to launch Chromium. Run: ${execCommand(deckPackageManager(projectRoot), ["playwright", "install", "chromium"])}`,
      { cause: error }
    )
  }
}

export async function openSlide(
  page: Page,
  baseUrl: string,
  id: string,
  colorMode: ColorMode
): Promise<void> {
  await page.goto(`${baseUrl}/slides/${id}`, { waitUntil: "networkidle" })
  await page.waitForTimeout(80)

  assertColorMode(
    await page.evaluate(() => [...document.documentElement.classList]),
    colorMode,
    id
  )
}

// The context color scheme only answers a theme that asks the operating system.
// The stored choice is what a theme with a default of its own reads first.
async function seedColorMode(
  context: BrowserContext,
  colorMode: ColorMode
): Promise<void> {
  await context.addInitScript(
    ({ key, mode }) => {
      window.localStorage.setItem(key, mode)
    },
    { key: colorModeStorageKey, mode: colorMode }
  )
}

// Build, serve, and open one page sized so the canvas renders at scale 1, which is what every capture below needs.
export async function withCanvasSession<T>(
  options: SessionOptions,
  run: (session: CanvasSession) => Promise<T>
): Promise<T> {
  ensureBuild(options.profile, options.skipBuild)

  const baseUrl = `http://127.0.0.1:${options.port}`

  await assertPortIsFree(baseUrl)

  const server = startNextServer(options.port, options.profile.env)

  try {
    await waitForServer(baseUrl, server)

    const ids = await readSlideIds(baseUrl)
    const browser = await launchBrowser()

    try {
      const context = await browser.newContext({
        colorScheme: options.colorMode,
        viewport: { height: 1080, width: 1920 },
      })

      await seedColorMode(context, options.colorMode)

      const page = await context.newPage()

      await openSlide(page, baseUrl, ids[0], options.colorMode)

      const canvas = await readCanvasGeometry(page)
      const gutter = canvas.margin * 2

      await page.setViewportSize({
        height: canvas.height + gutter,
        width: canvas.width + gutter,
      })

      return await run({ baseUrl, canvas, ids, page })
    } finally {
      await browser.close()
    }
  } finally {
    await server.stop()
  }
}
