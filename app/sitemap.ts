import type { MetadataRoute } from "next";

/**
 * Minimal sitemap. The current marketing surface is single-page (`/`)
 * with `/concepts` exploration pages excluded from indexing (they're
 * internal references). When new public routes ship, add them here.
 *
 * Excluded by design: `/api/*`, `/_next/*` (already disallowed in
 * robots.ts), `/concepts/*` (internal exploration), the OG image route,
 * and the favicon route.
 *
 * `lastModified` is build-time. For routes whose content changes
 * frequently (e.g., a future blog), switch to a per-route function.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://findgod.com";
  const lastModified = new Date();

  return [
    {
      url: `${base}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
