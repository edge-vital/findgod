import type { MetadataRoute } from "next";

/**
 * Production: allow all crawlers everywhere.
 * Preview / non-production: disallow all crawlers (don't let preview
 * deploys leak into search indexes).
 *
 * Replaces the previous /robots.txt → 404 behavior. Also resolves the
 * conflicting `<meta name="robots">` tags noted in the 2026-05-03
 * audit (Next was emitting a default + our explicit one; an explicit
 * robots.txt is the canonical source crawlers honor first).
 */
export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.VERCEL_ENV === "production";

  if (!isProd) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Don't expose internal Next.js + API surface to crawlers. They'd
        // burn crawl budget on machine-only paths.
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: "https://findgod.com/sitemap.xml",
  };
}
