import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { getVerseByRef } from "@/lib/todays-verse";

/**
 * Verse-as-Art share image. Renders a 1080×1080 Instagram-square image
 * for any scripture reference in our curated list. Returns 404 for
 * anything else — that's the brand-safety guard that keeps prompt-
 * injection-supplied text from being rendered as FINDGOD-branded art.
 *
 * Usage from the chat: `/api/verse-image?ref=Proverbs%2027:17`. Cached
 * immutably at the CDN edge — content never changes for a given ref.
 */
export const runtime = "nodejs";

const fontsDir = join(process.cwd(), "public", "fonts");
const archivoBlack = readFileSync(join(fontsDir, "ArchivoBlack-Regular.ttf"));
const jetbrainsMono = readFileSync(
  join(fontsDir, "JetBrainsMono-Regular.ttf"),
);

const SIZE = { width: 1080, height: 1080 };

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  if (!ref) {
    return new Response("Missing ref", { status: 400 });
  }

  const verse = getVerseByRef(ref);
  if (!verse) {
    return new Response("Verse not in curated set", { status: 404 });
  }

  // Verse-text-length-aware font sizing. Long verses get smaller type
  // so the layout doesn't break. Tuned by hand against the 33 curated
  // entries — none currently exceed ~200 chars, but the bound holds for
  // future additions too.
  const textLen = verse.text.length;
  const verseFontSize =
    textLen > 180 ? 44 : textLen > 130 ? 52 : textLen > 90 ? 60 : 72;

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
          padding: "100px 80px",
        }}
      >
        {/* Vignette — pulls the eye to center */}
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

        {/* Subtle gold aura behind the verse */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 900,
            height: 600,
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(ellipse at center, rgba(196,168,124,0.16) 0%, rgba(196,168,124,0.04) 35%, transparent 70%)",
          }}
        />

        {/* Top inscription — ΙΗΣΟΥΣ ≡ 888 */}
        <div
          style={{
            position: "absolute",
            top: 76,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
          }}
        >
          <div
            style={{ height: 1, width: 50, background: "rgba(240,237,230,0.3)" }}
          />
          <span
            style={{
              fontFamily: "JetBrainsMono",
              fontSize: 15,
              letterSpacing: 7,
              color: "rgba(196,168,124,0.88)",
              textTransform: "uppercase",
            }}
          >
            ΙΗΣΟΥΣ ≡ 888
          </span>
          <div
            style={{ height: 1, width: 50, background: "rgba(240,237,230,0.3)" }}
          />
        </div>

        {/* Verse text */}
        <div
          style={{
            fontFamily: "ArchivoBlack",
            fontSize: verseFontSize,
            letterSpacing: -1.2,
            lineHeight: 1.18,
            color: "#F0EDE6",
            textAlign: "center",
            textTransform: "uppercase",
            maxWidth: 900,
            position: "relative",
            display: "flex",
          }}
        >
          {verse.text}
        </div>

        {/* Gold hairline + verse reference */}
        <div
          style={{
            position: "absolute",
            bottom: 200,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
          }}
        >
          <div
            style={{
              height: 1,
              width: 64,
              background: "rgba(196,168,124,0.7)",
            }}
          />
          <span
            style={{
              fontFamily: "JetBrainsMono",
              fontSize: 22,
              letterSpacing: 6,
              color: "rgba(240,237,230,0.78)",
              textTransform: "uppercase",
            }}
          >
            {verse.ref} (ESV)
          </span>
        </div>

        {/* Bottom — FINDGOD wordmark */}
        <div
          style={{
            position: "absolute",
            bottom: 84,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "ArchivoBlack",
              fontSize: 22,
              letterSpacing: -0.5,
              color: "rgba(240,237,230,0.55)",
              textTransform: "uppercase",
            }}
          >
            FINDGOD
          </span>
        </div>
      </div>
    ),
    {
      ...SIZE,
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
      headers: {
        // The image for a specific ref never changes — immutable caching
        // is correct, and cheap.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  );
}
