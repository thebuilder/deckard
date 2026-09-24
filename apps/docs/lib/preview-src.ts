import { resolveRepoFile } from "./repo-file"

/*
 * The URL of a capture under public/, checked when the page builds. Every
 * component that shows a capture takes its src from here, so a slide or a theme
 * nobody photographed fails the build instead of shipping a broken image. The
 * paths come from slide-previews.ts, which the capture script also imports, so
 * the check lives here rather than there.
 */
export function previewSrc(path: string): string {
  if (resolveRepoFile(`apps/docs/public${path}`) === null) {
    throw new Error(
      `[preview-src] public${path} is missing. Run \`pnpm --filter playground docs:previews\` against a running playground.`
    )
  }

  return path
}
