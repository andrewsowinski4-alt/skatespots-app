/**
 * Canonical origin for metadata, Open Graph, sitemap, and robots.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://skatespot.guide).
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (raw) return raw.replace(/\/$/, '')
  return 'https://skatespot.guide'
}

export function getMetadataBase(): URL {
  return new URL(`${getSiteUrl()}/`)
}
