const defaultSiteUrl = "http://localhost:3000"

// Vercel names the deployment's own address at build time: the production
// domain on a production build, the branch alias on a preview.
function vercelUrl(): string | undefined {
  const host =
    process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : (process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL)

  return host ? `https://${host}` : undefined
}

/**
 * The deck's public origin, which every absolute URL it publishes is built on:
 * the sitemap entries and the share card each slide links. `siteUrl` when a
 * caller passes one, else `NEXT_PUBLIC_SITE_URL`, else the address Vercel
 * gives the deployment, else localhost.
 */
export function deckSiteUrl(siteUrl?: string): string {
  return (
    siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? vercelUrl() ?? defaultSiteUrl
  )
}
