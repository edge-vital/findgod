import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Auto-picked up by Next.js as the OG share image for every route under app/.
// Meta, Twitter, iMessage, Slack, Discord, LinkedIn all request it when the
// URL gets shared. Rendered once, cached heavily at the CDN edge.

export const alt =
  "FINDGOD — The world is noise. This isn't. Scripture-anchored for the man still searching.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Load fonts once per cold-start from /public/fonts/. Satori demands
// TTF/OTF (no WOFF/WOFF2). Reading from disk works at both build time and
// runtime on Vercel — `process.cwd()` resolves to the function's project
// root in both contexts, and /public is included in the function bundle.
const fontsDir = join(process.cwd(), "public", "fonts");
const archivoBlack = readFileSync(join(fontsDir, "ArchivoBlack-Regular.ttf"));
const jetbrainsMono = readFileSync(
  join(fontsDir, "JetBrainsMono-Regular.ttf"),
);

export default async function Image() {

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          color: "#F0EDE6",
          position: "relative",
        }}
      >
        {/* LAYER 1 — Deep vignette pulls the eye to center, kills edges. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(ellipse at center, rgba(30,30,35,0.55) 0%, #000 78%)",
          }}
        />

        {/* LAYER 2 — Warm gold aura behind the wordmark. Cinematic depth
            that reads like a candle lighting the scene from behind. */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 1100,
            height: 520,
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(ellipse at center, rgba(196,168,124,0.22) 0%, rgba(196,168,124,0.08) 25%, rgba(196,168,124,0.02) 55%, transparent 75%)",
          }}
        />

        {/* LAYER 3 — Tighter inner glow hugging the wordmark itself. */}
        <div
          style={{
            position: "absolute",
            top: "46%",
            left: "50%",
            width: 780,
            height: 280,
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(ellipse at center, rgba(240,237,230,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Top inscription — ΙΗΣΟΥΣ ≡ 888 */}
        <div
          style={{
            position: "absolute",
            top: 56,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              height: 1,
              width: 56,
              background: "rgba(240,237,230,0.3)",
            }}
          />
          <span
            style={{
              fontFamily: "JetBrainsMono",
              fontSize: 16,
              letterSpacing: 8,
              color: "rgba(196,168,124,0.88)",
              textTransform: "uppercase",
            }}
          >
            ΙΗΣΟΥΣ ≡ 888
          </span>
          <div
            style={{
              height: 1,
              width: 56,
              background: "rgba(240,237,230,0.3)",
            }}
          />
        </div>

        {/* FINDGOD wordmark — Archivo Black, tight tracking */}
        <div
          style={{
            fontFamily: "ArchivoBlack",
            fontSize: 184,
            letterSpacing: -6,
            lineHeight: 1,
            color: "#F0EDE6",
            textTransform: "uppercase",
            marginBottom: 44,
            position: "relative",
          }}
        >
          FINDGOD
        </div>

        {/* Gold hairline */}
        <div
          style={{
            height: 1,
            width: 72,
            background: "rgba(196,168,124,0.7)",
            marginBottom: 30,
          }}
        />

        {/* Primary headline */}
        <div
          style={{
            fontFamily: "ArchivoBlack",
            fontSize: 56,
            letterSpacing: -1.4,
            lineHeight: 1.1,
            color: "#F0EDE6",
            textAlign: "center",
            textTransform: "uppercase",
            marginBottom: 28,
            maxWidth: 940,
          }}
        >
          The world is noise. This isn&apos;t.
        </div>

        {/* Subhead */}
        <div
          style={{
            fontFamily: "JetBrainsMono",
            fontSize: 18,
            letterSpacing: 4,
            color: "rgba(240,237,230,0.55)",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          Scripture-anchored · For the man still searching
        </div>

        {/* Bottom — findgod.com */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "JetBrainsMono",
              fontSize: 14,
              letterSpacing: 5,
              color: "rgba(240,237,230,0.38)",
              textTransform: "uppercase",
            }}
          >
            findgod.com
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "ArchivoBlack",
          data: archivoBlack,
          weight: 900,
          style: "normal",
        },
        {
          name: "JetBrainsMono",
          data: jetbrainsMono,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );
}
