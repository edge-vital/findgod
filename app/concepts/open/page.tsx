import { Archivo, Inter, JetBrains_Mono } from "next/font/google";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "900"],
  variable: "--font-archivo",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

/* ============================================================
   PRIMITIVES
   ============================================================ */

function SectionHeader({
  number,
  title,
  blurb,
}: {
  number: string;
  title: string;
  blurb: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/10 pb-8">
      <div
        className="flex items-baseline gap-4"
        style={{ fontFamily: "var(--font-jetbrains)" }}
      >
        <span className="text-xs uppercase tracking-[0.3em] opacity-50">
          Open · {number}
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <h2
        className="uppercase leading-[0.9] tracking-[-0.02em]"
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 900,
          fontSize: "clamp(36px, 5.5vw, 64px)",
        }}
      >
        {title}
      </h2>
      <p className="max-w-2xl text-sm leading-relaxed opacity-60">{blurb}</p>
    </div>
  );
}

function TaglineCard({
  id,
  text,
  origin,
  note,
}: {
  id: string;
  text: string;
  origin: string;
  note: string;
}) {
  return (
    <div className="relative flex min-h-[260px] flex-col justify-between gap-5 rounded-lg border border-white/10 bg-black p-6 text-white">
      <div
        className="flex items-baseline justify-between gap-3 border-b border-white/20 pb-2"
        style={{ fontFamily: "var(--font-jetbrains)" }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] opacity-80">
          {id}
        </span>
        <span className="text-[10px] uppercase tracking-[0.15em] opacity-60">
          {origin}
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center px-2">
        <p
          className="text-center uppercase leading-[1.05] tracking-[-0.01em]"
          style={{
            fontFamily: "var(--font-archivo)",
            fontWeight: 900,
            fontSize: "clamp(20px, 2.4vw, 28px)",
          }}
        >
          {text}
        </p>
      </div>

      <p className="text-xs leading-relaxed opacity-50">{note}</p>
    </div>
  );
}

/* ============================================================
   TAGLINE CANDIDATES
   ============================================================ */

const TAGLINE_FINALISTS = [
  {
    id: "TL07",
    text: "Iron sharpens iron.",
    origin: "Reworded — Proverbs 27:17",
    note: "About brotherhood, not war. Already used in the signup wall. Fits the brotherhood note of the brand promise. Risk: a very common phrase, less ownable.",
  },
  {
    id: "TL08",
    text: "Stop scrolling. Start kneeling.",
    origin: "Original — biblical tone",
    note: "Names the modern idol (phones) and the ancient answer (prayer) in 4 words. Peak urgent/raw. Risk: a little on-the-nose, could feel gimmicky.",
  },
  {
    id: "TL09",
    text: "The world is noise. This isn't.",
    origin: "Original — biblical tone",
    note: "Names the reader's fatigue and positions FINDGOD as the quiet room. Pairs beautifully with the dark/monastic aesthetic. Possibly the most on-brand option.",
  },
  {
    id: "TL11",
    text: "You weren't built for comfort.",
    origin: "Original — biblical tone",
    note: "Pure conviction punch. Masculine, forged. Fits chest hits AND homepages. Risk: doesn't mention scripture or God at all.",
  },
];

/* ============================================================
   LOGO LOCKUPS
   ============================================================ */

function EightSeal({ size = 56 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full border-[1.5px] border-current"
      style={{ width: size, height: size }}
    >
      <span
        className="leading-none tracking-[-0.06em]"
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 900,
          fontSize: size * 0.36,
        }}
      >
        888
      </span>
    </div>
  );
}

function Wordmark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="uppercase leading-none tracking-[-0.03em]"
      style={{
        fontFamily: "var(--font-archivo)",
        fontWeight: 900,
        fontSize: size,
      }}
    >
      FINDGOD
    </span>
  );
}

function LogoCard({
  id,
  note,
  bg = "#000",
  fg = "#F0EDE6",
  height = 220,
  children,
}: {
  id: string;
  note: string;
  bg?: string;
  fg?: string;
  height?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex flex-col justify-between gap-5 rounded-lg border border-white/10 p-6"
      style={{ background: bg, color: fg, minHeight: 320 }}
    >
      <div
        className="flex items-baseline justify-between gap-3 border-b pb-2"
        style={{
          fontFamily: "var(--font-jetbrains)",
          borderColor: bg === "#000" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
        }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] opacity-80">
          {id}
        </span>
        <span className="text-[10px] uppercase tracking-[0.15em] opacity-60">
          {note}
        </span>
      </div>
      <div
        className="flex flex-1 items-center justify-center px-2"
        style={{ minHeight: height }}
      >
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   COMPACT MARK GLYPHS — for nav, favicon-alt, hat patches, small contexts
   These are FG-based variations with cross or 888 integrated.
   ============================================================ */

function CM01_CrossOverFG({ size = 100 }: { size?: number }) {
  // FG tight-kerned with small cross floating above
  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        viewBox="0 0 30 36"
        width={size * 0.32}
        height={size * 0.4}
        fill="currentColor"
        aria-label="cross"
      >
        <rect x="13" y="0" width="4" height="36" />
        <rect x="3" y="10" width="24" height="4" />
      </svg>
      <span
        className="uppercase leading-none"
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 900,
          fontSize: size,
          letterSpacing: "-0.18em",
        }}
      >
        FG
      </span>
    </div>
  );
}

function CM02_FGSeal({ size = 140 }: { size?: number }) {
  // FG inside a circle seal (matches the 888 seal style)
  return (
    <div
      className="flex items-center justify-center rounded-full border-[3px] border-current"
      style={{ width: size, height: size }}
    >
      <span
        className="uppercase leading-none"
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 900,
          fontSize: size * 0.46,
          letterSpacing: "-0.16em",
        }}
      >
        FG
      </span>
    </div>
  );
}

function CM03_FCross({ size = 130 }: { size?: number }) {
  // F where the horizontal arm extends both directions, forming a cross.
  // The vertical of F + the extended top arm = a cross. The middle arm
  // is what identifies it as an F. Suggests FG via implication.
  return (
    <svg
      viewBox="0 0 100 130"
      width={size * 0.85}
      height={size}
      fill="currentColor"
      aria-label="F-cross"
    >
      {/* Cross horizontal — extends past where F's top arm would normally end */}
      <rect x="0" y="22" width="100" height="18" />
      {/* F vertical spine */}
      <rect x="38" y="0" width="18" height="130" />
      {/* F middle arm — short, identifies the F */}
      <rect x="38" y="62" width="46" height="14" />
    </svg>
  );
}

function CM04_FG888({ size = 120 }: { size?: number }) {
  // FG big with tiny 888 mono caption underneath
  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className="uppercase leading-none"
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 900,
          fontSize: size,
          letterSpacing: "-0.18em",
        }}
      >
        FG
      </span>
      <span
        className="text-[10px] uppercase tracking-[0.4em] opacity-70"
        style={{ fontFamily: "var(--font-jetbrains)" }}
      >
        ─ 888 ─
      </span>
    </div>
  );
}

function CM05_FCrossG({ size = 100 }: { size?: number }) {
  // F + cross + G horizontal arrangement — the cross literally sits between
  // the two letters as the connective glyph
  return (
    <div className="flex items-center gap-3">
      <span
        className="uppercase leading-none"
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 900,
          fontSize: size,
          letterSpacing: "-0.04em",
        }}
      >
        F
      </span>
      <svg
        viewBox="0 0 30 40"
        width={size * 0.28}
        height={size * 0.42}
        fill="currentColor"
        aria-label="cross"
      >
        <rect x="12" y="0" width="6" height="40" />
        <rect x="3" y="14" width="24" height="6" />
      </svg>
      <span
        className="uppercase leading-none"
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 900,
          fontSize: size,
          letterSpacing: "-0.04em",
        }}
      >
        G
      </span>
    </div>
  );
}

function CM06_GCross({ size = 150 }: { size?: number }) {
  // G with cross carved into the bowl (negative space)
  return (
    <svg
      viewBox="0 0 130 130"
      width={size}
      height={size}
      fill="currentColor"
      aria-label="G-cross"
    >
      {/* G outer ring */}
      <rect x="10" y="10" width="110" height="22" />
      <rect x="10" y="10" width="22" height="110" />
      <rect x="10" y="98" width="110" height="22" />
      <rect x="98" y="98" width="22" height="22" />
      <rect x="98" y="60" width="22" height="40" />
      <rect x="65" y="60" width="55" height="18" />
      {/* Cross carved into the negative space (top-right of G's bowl) */}
      <rect x="58" y="38" width="6" height="22" fill="currentColor" />
      <rect x="50" y="44" width="22" height="6" fill="currentColor" />
    </svg>
  );
}

function CM07_FGCarvedCross({ size = 140 }: { size?: number }) {
  // Bold FG block with a small cross "carved" into the negative space
  // between the F's middle arm and the baseline
  return (
    <div className="relative inline-block leading-none">
      <span
        className="uppercase"
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 900,
          fontSize: size,
          letterSpacing: "-0.18em",
          display: "inline-block",
        }}
      >
        FG
      </span>
      <svg
        viewBox="0 0 30 40"
        className="absolute"
        style={{
          width: size * 0.18,
          height: size * 0.24,
          left: "26%",
          top: "62%",
        }}
        fill="currentColor"
        opacity="0.55"
        aria-label="cross"
      >
        <rect x="12" y="0" width="6" height="40" />
        <rect x="3" y="14" width="24" height="6" />
      </svg>
    </div>
  );
}

function CM08_FGSealNumeral({ size = 140 }: { size?: number }) {
  // FG over 888 inside circle seal — combo mark
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 rounded-full border-[3px] border-current"
      style={{ width: size, height: size }}
    >
      <span
        className="uppercase leading-none"
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 900,
          fontSize: size * 0.32,
          letterSpacing: "-0.14em",
        }}
      >
        FG
      </span>
      <span
        className="leading-none tracking-[-0.04em]"
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 900,
          fontSize: size * 0.18,
        }}
      >
        888
      </span>
    </div>
  );
}

const COMPACT_MARK_NOTES: Record<string, string> = {
  CM01: "FG with a small cross floating above. The cross gives instant Christian context; the FG identifies the brand. Reads small (favicon, nav corner) without losing the 'this is FINDGOD' message.",
  CM02: "FG inside the same circle seal style as the 888 seal. Builds visual consistency across all marks — they're clearly siblings. Could swap with the 888 seal in some contexts (when the 888 needs to be more direct).",
  CM03: "F-cross. The F's structure literally IS a cross — vertical spine + extended horizontal arm. Subtle, sculptural. Reads as 'F + cross' simultaneously. The G is implied by FINDGOD context.",
  CM04: "FG block with the 888 inscription as a small caption underneath. Marries the wordmark and signature in a compact mark. Most explicit FG + 888 connection.",
  CM05: "F · cross · G — the cross sits literally between the two letters as the connecting element. Brotherhood, lineage, what binds.",
  CM06: "G with a cross carved into the bowl as negative space. Sculptural, monastic. The cross emerges from inside the letterform itself. Most distinctive but most abstract.",
  CM07: "FG with a small cross overlaid in the negative space between the F's middle arm and the G. Subtle, refined — rewards close inspection.",
  CM08: "FG above 888 inside the circle seal. Most maximalist: combines wordmark initials, signature, AND seal. Could be too much, but it's the 'final boss' option for hat embroidery / app icon.",
};

/* ============================================================
   PAGE
   ============================================================ */

export default function ConceptsOpenPage() {
  return (
    <div
      className={`${archivo.variable} ${inter.variable} ${jetbrains.variable} min-h-screen bg-black text-white`}
      style={{ fontFamily: "var(--font-inter)" }}
    >
      {/* TOP BAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 px-6 py-4 backdrop-blur-md sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <span
            className="text-xs uppercase tracking-[0.3em] opacity-70 sm:text-sm"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            FINDGOD / OPEN · Brand decisions in flight
          </span>
          <div className="flex items-center gap-4">
            <a
              href="/concepts/v3"
              className="text-xs uppercase tracking-[0.2em] opacity-40 hover:opacity-80"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              v3
            </a>
            <a
              href="/concepts/v4"
              className="text-xs uppercase tracking-[0.2em] opacity-40 hover:opacity-80"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              v4
            </a>
          </div>
        </div>
      </header>

      {/* INTRO */}
      <section className="border-b border-white/10 px-6 py-12 sm:px-10 sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <span
            className="text-[10px] uppercase tracking-[0.3em] opacity-50"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            Help us decide · Send your picks
          </span>
          <h1
            className="uppercase leading-[0.9] tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 900,
              fontSize: "clamp(48px, 7vw, 96px)",
            }}
          >
            One call
            <br />
            left open.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed opacity-70">
            FINDGOD is being built in public. The wordmark, the 888 seal, the
            F-Cross compact mark, the primary lockup, the palette, and the
            scripture font are locked. One decision remains: the tagline
            (narrowed to 4 finalists). Pick the winner.
          </p>
          <div
            className="mt-2 flex flex-col gap-2 border-l border-white/20 pl-5"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            <span className="text-[10px] uppercase tracking-[0.3em] opacity-50">
              How to send picks
            </span>
            <p className="text-sm opacity-80">
              DM <span className="font-semibold">@findgod</span> on Instagram
              with the IDs you like. Example:{" "}
              <span className="opacity-100">
                &ldquo;TL09 + CM03. Lock both.&rdquo;
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* SECTIONS */}
      <div className="flex flex-col gap-24 px-6 py-20 sm:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-24">
          {/* ===== TAGLINE — narrowed to 4 finalists ===== */}
          <section className="flex flex-col gap-12">
            <SectionHeader
              number="01"
              title="Tagline · 4 Finalists"
              blurb="Narrowed from 17 to 4. The brand promise line that sits under the FINDGOD wordmark. Tone is urgent / raw. Pick the final winner."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {TAGLINE_FINALISTS.map((t) => (
                <TaglineCard key={t.id} {...t} />
              ))}
            </div>
          </section>

          {/* ===== LOCKED MARKS RECAP ===== */}
          <section className="flex flex-col gap-12">
            <SectionHeader
              number="02"
              title="Locked · Marks System"
              blurb="The full mark system is closed. Three pieces serve three jobs: the primary lockup for ceremonial use, the 888 seal for inscriptions and signatures, and the F-Cross compact mark for product surfaces."
            />

            <div className="grid gap-4 md:grid-cols-3">
              {/* L05 — Primary lockup */}
              <div className="flex flex-col gap-5 rounded-lg border border-[#C4A87C]/40 bg-[#C4A87C]/[0.04] p-6">
                <div
                  className="flex items-baseline justify-between gap-3 border-b border-[#C4A87C]/30 pb-2"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#C4A87C]">
                    L05 · LOCKED
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.15em] opacity-60">
                    Primary lockup
                  </span>
                </div>
                <div className="flex min-h-[160px] flex-1 items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Wordmark size={40} />
                    <div
                      className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-white/60"
                      style={{ fontFamily: "var(--font-jetbrains)" }}
                    >
                      <span className="h-px w-6 bg-current opacity-40" />
                      <span>ΙΗΣΟΥΣ ≡ 888</span>
                      <span className="h-px w-6 bg-current opacity-40" />
                    </div>
                  </div>
                </div>
                <p className="text-xs leading-relaxed opacity-60">
                  Wordmark + Greek isopsephy as subtitle. Official combo for
                  first-visit pages, ceremonial contexts, and homepage hero.
                </p>
              </div>

              {/* M05B — 888 Seal */}
              <div className="flex flex-col gap-5 rounded-lg border border-[#C4A87C]/40 bg-[#C4A87C]/[0.04] p-6">
                <div
                  className="flex items-baseline justify-between gap-3 border-b border-[#C4A87C]/30 pb-2"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#C4A87C]">
                    M05B · LOCKED
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.15em] opacity-60">
                    Brand signature
                  </span>
                </div>
                <div className="flex min-h-[160px] flex-1 items-center justify-center">
                  <EightSeal size={120} />
                </div>
                <p className="text-xs leading-relaxed opacity-60">
                  The 888 Seal. Used as favicon, in inscriptions, footer
                  signatures, AI loading pulse, and ceremonial signoffs.
                </p>
              </div>

              {/* CM03 — F-Cross */}
              <div className="flex flex-col gap-5 rounded-lg border border-[#C4A87C]/40 bg-[#C4A87C]/[0.04] p-6">
                <div
                  className="flex items-baseline justify-between gap-3 border-b border-[#C4A87C]/30 pb-2"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#C4A87C]">
                    CM03 · LOCKED
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.15em] opacity-60">
                    Compact mark
                  </span>
                </div>
                <div className="flex min-h-[160px] flex-1 items-center justify-center">
                  <CM03_FCross size={140} />
                </div>
                <p className="text-xs leading-relaxed opacity-60">
                  The F-Cross. Brand initial that IS a cross. Reserved for hat
                  embroidery, app icons, business cards, and tight product
                  surfaces.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* HOW TO DECIDE */}
      <section className="border-t border-white/10 px-6 py-16 sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <span
            className="text-[10px] uppercase tracking-[0.3em] opacity-50"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            How to send picks
          </span>
          <h2
            className="uppercase leading-[0.9] tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 900,
              fontSize: "clamp(32px, 5vw, 56px)",
            }}
          >
            Tell us what hits.
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                h: "Lock your favorite",
                p: "\"TL09 + ST03. Lock both.\"",
              },
              {
                h: "Mix and match",
                p: "\"TL12 for the homepage, TL08 for merch.\"",
              },
              {
                h: "Suggest your own",
                p: "\"None of these. Try: 'Quiet the feed. Open the Book.'\"",
              },
            ].map((item) => (
              <div
                key={item.h}
                className="flex flex-col gap-2 border border-white/10 p-5"
              >
                <span
                  className="text-xs uppercase tracking-[0.25em] opacity-80"
                  style={{
                    fontFamily: "var(--font-archivo)",
                    fontWeight: 900,
                  }}
                >
                  {item.h}
                </span>
                <p className="text-sm italic opacity-60">{item.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black px-6 py-10 sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="text-xs uppercase tracking-[0.3em] opacity-50"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            FINDGOD / OPEN · Brand decisions in flight
          </p>
          <p
            className="text-xs uppercase tracking-[0.3em] opacity-40"
            title="ΙΗΣΟΥΣ ≡ 888 — the isopsephy of Jesus (Irenaeus, c. 180 AD)"
          >
            ΙΗΣΟΥΣ ≡ 888
          </p>
        </div>
      </footer>
    </div>
  );
}
