import type { Metadata } from "next";
import {
  Archivo,
  EB_Garamond,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "900"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

/**
 * Resolve the canonical site URL used to absolutize metadata/OG links.
 * Priority:
 *   1. `NEXT_PUBLIC_SITE_URL` — explicit override if someone sets it.
 *   2. `VERCEL_PROJECT_PRODUCTION_URL` — Vercel auto-sets this to the
 *      aliased custom domain in production (e.g. `findgod.com`).
 *   3. `VERCEL_URL` — the per-deployment URL (preview builds,
 *      production builds before the custom domain is aliased).
 *   4. Local dev fallback.
 *
 * Without this, OG tags end up pointing at `http://localhost:3000` in
 * production — which iMessage, Slack, Twitter, etc. can't fetch, so they
 * fall back to a generic icon. That bug once made FINDGOD previews
 * show a Vercel triangle in iMessage. Don't let that happen again.
 */
function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export const metadata: Metadata = {
  title: "FINDGOD — The world is noise. This isn't.",
  description:
    "Scripture-anchored AI companion for the man still searching. Free to chat. Iron sharpens iron.",
  metadataBase: new URL(getSiteUrl()),
  openGraph: {
    title: "FINDGOD — The world is noise. This isn't.",
    description: "Scripture-anchored. For the man still searching.",
    type: "website",
    siteName: "FINDGOD",
    url: "https://findgod.com",
    // opengraph-image.tsx at app/ root provides the 1200×630 share image
    // automatically — Next.js wires it in.
  },
  twitter: {
    card: "summary_large_image",
    title: "FINDGOD — The world is noise. This isn't.",
    description: "Scripture-anchored. For the man still searching.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${archivo.variable} ${jetbrains.variable} ${ebGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#050507] text-white font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
