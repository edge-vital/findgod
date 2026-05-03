import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

/**
 * Security header block applied to every route.
 *
 * Scope notes:
 * - CSP uses `'unsafe-inline'` for scripts/styles because Next.js emits
 *   inline hydration scripts and Tailwind/next/font emit inline styles.
 *   A nonce-based CSP would tighten this further but requires a proxy.ts.
 * - `connect-src 'self'` is enough today — Beehiiv calls are server-side
 *   (app/actions.ts), so the browser never fetches api.beehiiv.com.
 * - `frame-ancestors 'none'` enforces clickjacking protection in modern
 *   browsers; `X-Frame-Options` is kept as a fallback for older clients.
 */
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    // Includes opt-out from Google Topics API (browsing-topics) +
    // Federated Learning of Cohorts (interest-cohort) — both ship-by-
    // default in Chromium and would otherwise enroll our visitors in
    // ad-tracking signal harvesting.
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()",
  },
  {
    // Defends against same-origin window confusion (Spectre-class) by
    // blocking cross-origin window references from external openers.
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    // Same-origin only — prevents this site's resources from being
    // embedded as <img>/<script>/<iframe> from other origins.
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
  {
    // Prevent the browser from speculatively resolving DNS for outbound
    // links. Avoids leaking link metadata to third-party DNS providers.
    key: "X-DNS-Prefetch-Control",
    value: "off",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withBotId(nextConfig);
