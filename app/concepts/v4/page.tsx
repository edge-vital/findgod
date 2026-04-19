import {
  Archivo,
  Inter,
  JetBrains_Mono,
  Instrument_Serif,
  EB_Garamond,
  Playfair_Display,
  Cormorant_Garamond,
  Bodoni_Moda,
} from "next/font/google";

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
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
});
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
});

/* ============================================================
   SHARED PRIMITIVES
   ============================================================ */

function Label({ id, note }: { id: string; note: string }) {
  return (
    <div
      className="flex items-baseline justify-between gap-3 border-b border-white/20 pb-2"
      style={{ fontFamily: "var(--font-jetbrains)" }}
    >
      <span className="text-[10px] uppercase tracking-[0.3em] opacity-80">
        {id}
      </span>
      <span className="text-[10px] uppercase tracking-[0.15em] opacity-60">
        {note}
      </span>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-lg border border-white/10 bg-black p-6 text-white">
      {children}
    </div>
  );
}

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
          Section {number}
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

function FamilyHeader({
  number,
  name,
  description,
  reference,
}: {
  number: string;
  name: string;
  description: string;
  reference: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex items-baseline gap-3"
        style={{ fontFamily: "var(--font-jetbrains)" }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] opacity-40">
          Family M{number}
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <h3
        className="uppercase leading-[0.95] tracking-[-0.02em]"
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 900,
          fontSize: "clamp(22px, 2.5vw, 30px)",
        }}
      >
        {name}
      </h3>
      <p className="max-w-xl text-xs leading-relaxed opacity-60">
        {description}
      </p>
      <p
        className="text-[10px] uppercase tracking-[0.25em] opacity-40"
        style={{ fontFamily: "var(--font-jetbrains)" }}
      >
        Reference: {reference}
      </p>
    </div>
  );
}

/* ============================================================
   MONOGRAM MARKS (SVG GLYPHS)
   ============================================================ */

function ChiRhoGlyph({ size = 180 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 120 160"
      width={size * 0.85}
      height={size}
      aria-label="Chi-Rho"
      fill="none"
      stroke="currentColor"
      strokeWidth="10"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      {/* Chi (X) — two diagonals, longer descenders for a grounded feel */}
      <line x1="18" y1="48" x2="102" y2="150" />
      <line x1="102" y1="48" x2="18" y2="150" />
      {/* Rho (P) — vertical stem rising through the chi's center */}
      <line x1="60" y1="4" x2="60" y2="130" />
      {/* Rho bowl — sharper geometric arc, sits upper-right of stem */}
      <path d="M60 10 C 96 10 104 28 104 40 C 104 55 92 68 60 68" strokeWidth="10" />
    </svg>
  );
}

function ChiRhoStampedGlyph({ size = 180 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full border-[3px] border-current"
      style={{ width: size, height: size }}
    >
      <ChiRhoGlyph size={size * 0.78} />
    </div>
  );
}

function FGLigatureKerned() {
  return (
    <div className="relative inline-block leading-none">
      <span
        className="uppercase"
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 900,
          fontSize: "clamp(140px, 20vw, 220px)",
          letterSpacing: "-0.22em",
          display: "inline-block",
        }}
      >
        FG
      </span>
    </div>
  );
}

function FGLigatureBlock() {
  return (
    <div className="relative inline-flex items-stretch">
      <span
        className="uppercase leading-[0.82]"
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 900,
          fontSize: "clamp(140px, 20vw, 220px)",
          letterSpacing: "-0.04em",
        }}
      >
        F
      </span>
      <span
        className="uppercase leading-[0.82] -ml-[0.22em]"
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 900,
          fontSize: "clamp(140px, 20vw, 220px)",
          letterSpacing: "-0.04em",
          transform: "translateY(0.22em)",
        }}
      >
        G
      </span>
    </div>
  );
}

function NarrowGateGlyph({ size = 180 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 100 150"
      width={size * 0.72}
      height={size}
      aria-label="Narrow gate"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinejoin="miter"
      strokeLinecap="square"
    >
      {/* Arch outline — tall rectangle, rounded top, cross integrated into keystone */}
      <path d="M15 148 L15 55 Q15 15, 50 15 Q85 15, 85 55 L85 148" />
      {/* Integrated cross — stem descends from apex into the arch, not floating */}
      <line x1="50" y1="0" x2="50" y2="30" strokeWidth="6" />
      <line x1="40" y1="10" x2="60" y2="10" strokeWidth="6" />
    </svg>
  );
}

function NarrowGateSolidGlyph({ size = 180 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 100 150"
      width={size * 0.72}
      height={size}
      aria-label="Narrow gate solid"
      fill="currentColor"
    >
      {/* Outer gate silhouette */}
      <path d="M15 148 L15 55 Q15 15, 50 15 Q85 15, 85 55 L85 148 Z" />
      {/* Inner door cutout — proportionally centered */}
      <path d="M38 148 L38 68 Q38 40, 50 40 Q62 40, 62 68 L62 148 Z" fill="#000" />
      {/* Cross carved into the keystone — integrated, not floating */}
      <rect x="47" y="22" width="6" height="24" fill="#000" />
      <rect x="40" y="30" width="20" height="6" fill="#000" />
    </svg>
  );
}

function SwordGlyph({ size = 180 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 60 200"
      width={size * 0.36}
      height={size}
      aria-label="Sword of the Spirit"
      fill="currentColor"
    >
      {/* Pommel (top) — slightly smaller, more proportional */}
      <circle cx="30" cy="12" r="6" />
      {/* Grip */}
      <rect x="27" y="18" width="6" height="26" />
      {/* Crossguard = the cross itself */}
      <rect x="4" y="44" width="52" height="8" />
      {/* Blade — tapering triangular point */}
      <path d="M30 52 L43 64 L43 162 L30 190 L17 162 L17 64 Z" />
    </svg>
  );
}

function SwordMinimalGlyph({ size = 180 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 60 200"
      width={size * 0.36}
      height={size}
      aria-label="Sword minimal"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      {/* Blade vertical */}
      <line x1="30" y1="14" x2="30" y2="178" />
      {/* Crossguard */}
      <line x1="8" y1="48" x2="52" y2="48" />
      {/* Triangular tip (solid triangle for a decisive blade point) */}
      <path d="M16 174 L30 192 L44 174 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ============================================================
   MONOGRAM CARDS
   ============================================================ */

function MonogramSection() {
  return (
    <section className="flex flex-col gap-12">
      <SectionHeader
        number="01"
        title="Monogram Directions"
        blurb="Five directions, each with two variations. Tell me the IDs that hit. The monogram is the stamp — small, sharp, wearable. It should mean something the second someone sees it."
      />

      {/* FAMILY M01 — Chi-Rho */}
      <div className="flex flex-col gap-6">
        <FamilyHeader
          number="01"
          name="The Chi-Rho (ΧΡ)"
          description="The ancient monogram for Christ — used by the early church and Constantine since 312 AD. Predates modern church branding. Historical weight, zero corny."
          reference="Constantine's labarum, Orthodox iconography, Catacomb inscriptions"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <Label id="M01A" note="Brutalist open glyph" />
            <div className="flex flex-1 items-center justify-center">
              <ChiRhoGlyph size={180} />
            </div>
            <FooterMeta
              palette={["#000000", "#F0EDE6"]}
              note="hat · chest hit"
            />
          </Card>
          <Card>
            <Label id="M01B" note="Circle stamp / seal" />
            <div className="flex flex-1 items-center justify-center">
              <ChiRhoStampedGlyph size={180} />
            </div>
            <FooterMeta
              palette={["#000000", "#F0EDE6"]}
              note="favicon · app icon"
            />
          </Card>
        </div>
      </div>

      {/* FAMILY M02 — FG ligature */}
      <div className="flex flex-col gap-6">
        <FamilyHeader
          number="02"
          name="Custom FG Ligature"
          description="F and G fused into one bespoke letterform. Not 'FG in a box' — a single custom glyph that reads as a unified mark. Hermes/LV-level custom monogram energy."
          reference="Louis Vuitton LV, Chanel CC, Saint Laurent SL"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <Label id="M02A" note="Horizontal · tight-kerned" />
            <div className="flex flex-1 items-center justify-center">
              <FGLigatureKerned />
            </div>
            <FooterMeta
              palette={["#000000", "#F0EDE6"]}
              note="embroidered cap"
            />
          </Card>
          <Card>
            <Label id="M02B" note="Interlocked block · cascade" />
            <div className="flex flex-1 items-center justify-center">
              <FGLigatureBlock />
            </div>
            <FooterMeta
              palette={["#000000", "#F0EDE6"]}
              note="woven tag · chest patch"
            />
          </Card>
        </div>
      </div>

      {/* FAMILY M03 — Narrow Gate */}
      <div className="flex flex-col gap-6">
        <FamilyHeader
          number="03"
          name="The Narrow Gate"
          description="A minimal archway glyph with a cross at the peak. References Matthew 7:13-14 — 'Enter through the narrow gate.' Monastic, architectural, not literal."
          reference="Cistercian abbeys, monastery doorways, Romanesque church arches"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <Label id="M03A" note="Outlined gate" />
            <div className="flex flex-1 items-center justify-center">
              <NarrowGateGlyph size={180} />
            </div>
            <FooterMeta
              palette={["#000000", "#F0EDE6"]}
              note="chest print · signage"
            />
          </Card>
          <Card>
            <Label id="M03B" note="Solid stamp" />
            <div className="flex flex-1 items-center justify-center">
              <NarrowGateSolidGlyph size={180} />
            </div>
            <FooterMeta
              palette={["#000000", "#F0EDE6"]}
              note="app icon · stamp"
            />
          </Card>
        </div>
      </div>

      {/* FAMILY M04 — Sword of the Spirit */}
      <div className="flex flex-col gap-6">
        <FamilyHeader
          number="04"
          name="Sword of the Spirit"
          description="A downward sword whose crossguard IS the cross. References Ephesians 6:17 — 'the sword of the Spirit, which is the word of God.' Masculine, biblical, sharp."
          reference="Crusader iconography, Templar cross-sword, A24 film posters"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <Label id="M04A" note="Full sword silhouette" />
            <div className="flex flex-1 items-center justify-center">
              <SwordGlyph size={200} />
            </div>
            <FooterMeta
              palette={["#000000", "#F0EDE6"]}
              note="back print · hoodie"
            />
          </Card>
          <Card>
            <Label id="M04B" note="Minimal line sword" />
            <div className="flex flex-1 items-center justify-center">
              <SwordMinimalGlyph size={200} />
            </div>
            <FooterMeta
              palette={["#000000", "#F0EDE6"]}
              note="sleeve stamp · favicon"
            />
          </Card>
        </div>
      </div>

      {/* FAMILY M05 — 888 */}
      <div className="flex flex-col gap-6">
        <FamilyHeader
          number="05"
          name="888 — Isopsephy of Jesus"
          description="In ancient Greek gematria, the letters of ΙΗΣΟΥΣ (Jesus) sum to 888. Cited by early church fathers (Irenaeus, c. 180 AD) as a divine number. Three figures. Unmistakable."
          reference="Sibylline Oracles Book 1, Irenaeus 'Against Heresies', early Christian gematria"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <Label id="M05A" note="Hero numerals · inscribed" />
            <div className="flex flex-1 flex-col items-center justify-center gap-5">
              <span
                className="leading-none tracking-[-0.06em]"
                style={{
                  fontFamily: "var(--font-archivo)",
                  fontWeight: 900,
                  fontSize: "clamp(120px, 17vw, 220px)",
                }}
              >
                888
              </span>
              <div
                className="flex items-center gap-3 text-[11px] uppercase tracking-[0.35em]"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                <span className="h-px w-8 bg-current opacity-40" />
                <span className="opacity-90">ΙΗΣΟΥΣ ≡ 888</span>
                <span className="h-px w-8 bg-current opacity-40" />
              </div>
            </div>
            <FooterMeta
              palette={["#000000", "#F0EDE6"]}
              note="chest hit · back print"
            />
          </Card>
          <Card>
            <Label id="M05B" note="Stamped seal · inscribed" />
            <div className="flex flex-1 items-center justify-center">
              <div className="relative flex h-52 w-52 flex-col items-center justify-center gap-1 rounded-full border-[3px] border-current">
                <span
                  className="leading-none tracking-[-0.05em]"
                  style={{
                    fontFamily: "var(--font-archivo)",
                    fontWeight: 900,
                    fontSize: "96px",
                  }}
                >
                  888
                </span>
                <span
                  className="text-[9px] uppercase tracking-[0.4em] opacity-80"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  ΙΗΣΟΥΣ
                </span>
              </div>
            </div>
            <FooterMeta
              palette={["#000000", "#F0EDE6"]}
              note="hat patch · app icon"
            />
          </Card>
        </div>
      </div>
    </section>
  );
}

function FooterMeta({
  palette,
  note,
}: {
  palette: string[];
  note: string;
}) {
  return (
    <div className="flex items-center justify-between text-[10px]">
      <div className="flex gap-1.5">
        {palette.map((hex) => (
          <div
            key={hex}
            className="h-4 w-4 rounded-full border"
            style={{
              background: hex,
              borderColor: "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>
      <span
        className="opacity-50"
        style={{ fontFamily: "var(--font-jetbrains)" }}
      >
        {note}
      </span>
    </div>
  );
}

/* ============================================================
   SCRIPTURE TYPOGRAPHY SAMPLES
   ============================================================ */

function ScriptureCard({
  id,
  note,
  fontVar,
  italic = false,
  weight = 400,
  size = "20px",
  reference = "1 Corinthians 16:13 (ESV)",
}: {
  id: string;
  note: string;
  fontVar: string;
  italic?: boolean;
  weight?: number;
  size?: string;
  reference?: string;
}) {
  return (
    <Card>
      <Label id={id} note={note} />
      <div className="flex flex-1 flex-col justify-center gap-6">
        <p
          className="text-white"
          style={{
            fontFamily: fontVar,
            fontStyle: italic ? "italic" : "normal",
            fontWeight: weight,
            fontSize: size,
            lineHeight: 1.4,
            maxWidth: "28ch",
          }}
        >
          &ldquo;Be watchful, stand firm in the faith, act like men, be
          strong.&rdquo;
        </p>
        <span
          className="text-[10px] uppercase tracking-[0.3em] opacity-60"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          — {reference}
        </span>
      </div>
      <div
        className="text-[9px] uppercase tracking-[0.3em] opacity-40"
        style={{ fontFamily: "var(--font-jetbrains)" }}
      >
        Preview size only. Real use varies.
      </div>
    </Card>
  );
}

function TypographySection() {
  return (
    <section className="flex flex-col gap-12">
      <SectionHeader
        number="02"
        title="Scripture Typography"
        blurb="When scripture appears, should it look like the rest of the voice — or get its own visual weight? Same verse (1 Cor 16:13) rendered seven ways. Tell me which feels most like the Word."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ScriptureCard
          id="T01"
          note="Instrument Serif · italic"
          fontVar="var(--font-instrument)"
          italic
          size="22px"
        />
        <ScriptureCard
          id="T02"
          note="EB Garamond · italic"
          fontVar="var(--font-eb-garamond)"
          italic
          size="22px"
        />
        <ScriptureCard
          id="T03"
          note="Playfair Display · italic"
          fontVar="var(--font-playfair)"
          italic
          size="22px"
        />
        <ScriptureCard
          id="T04"
          note="Cormorant Garamond · italic"
          fontVar="var(--font-cormorant)"
          italic
          weight={500}
          size="24px"
        />
        <ScriptureCard
          id="T05"
          note="Bodoni Moda · italic"
          fontVar="var(--font-bodoni)"
          italic
          size="22px"
        />
        <ScriptureCard
          id="T06"
          note="All Archivo Black · no serif"
          fontVar="var(--font-archivo)"
          weight={900}
          size="18px"
        />
        <ScriptureCard
          id="T07"
          note="JetBrains Mono · utility"
          fontVar="var(--font-jetbrains)"
          size="14px"
        />
      </div>
    </section>
  );
}

/* ============================================================
   PAGE
   ============================================================ */

export default function ConceptsV4Page() {
  return (
    <div
      className={`${archivo.variable} ${inter.variable} ${jetbrains.variable} ${instrument.variable} ${ebGaramond.variable} ${playfair.variable} ${cormorant.variable} ${bodoni.variable} min-h-screen bg-black text-white`}
      style={{ fontFamily: "var(--font-inter)" }}
    >
      {/* TOP BAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 px-6 py-4 backdrop-blur-md sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <span
            className="text-xs uppercase tracking-[0.3em] opacity-70 sm:text-sm"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            FINDGOD / V4 · Monogram + Scripture Type
          </span>
          <div className="flex items-center gap-4">
            <a
              href="/concepts"
              className="text-xs uppercase tracking-[0.2em] opacity-40 hover:opacity-80"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              v1
            </a>
            <a
              href="/concepts/v2"
              className="text-xs uppercase tracking-[0.2em] opacity-40 hover:opacity-80"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              v2
            </a>
            <a
              href="/concepts/v3"
              className="text-xs uppercase tracking-[0.2em] opacity-40 hover:opacity-80"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              v3
            </a>
          </div>
        </div>
      </header>

      {/* INTRO */}
      <section className="border-b border-white/10 px-6 py-12 sm:px-10 sm:py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-5">
          <span
            className="text-[10px] uppercase tracking-[0.3em] opacity-50"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            What's locked · what's still open
          </span>
          <h1
            className="uppercase leading-[0.9] tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 900,
              fontSize: "clamp(40px, 6vw, 72px)",
            }}
          >
            Locked: the wordmark.
            <br />
            Open: the stamp +<br />
            the scripture voice.
          </h1>
          <div className="grid gap-6 pt-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 border-l border-white/20 pl-5">
              <span
                className="text-[10px] uppercase tracking-[0.3em] opacity-50"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                Already locked
              </span>
              <p className="text-sm opacity-80">
                06A centered FINDGOD wordmark. Pure jet black primary palette.
                Warm taupe / charcoal / stone as seasonal alternates.
                &ldquo;Season / Drop&rdquo; language parked until clothing.
                Wordmark always leads — monogram is the stamp.
              </p>
            </div>
            <div className="flex flex-col gap-2 border-l border-white/20 pl-5">
              <span
                className="text-[10px] uppercase tracking-[0.3em] opacity-50"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                Decide here
              </span>
              <p className="text-sm opacity-80">
                Pick a monogram direction (M01–M05) and a scripture type
                (T01–T07). You can mix, e.g.
                &ldquo;M05B stamp + T02 for scripture.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTIONS */}
      <div className="flex flex-col gap-24 px-6 py-20 sm:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-24">
          <MonogramSection />
          <TypographySection />
        </div>
      </div>

      {/* HOW TO DECIDE */}
      <section className="border-t border-white/10 px-6 py-16 sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <span
            className="text-[10px] uppercase tracking-[0.3em] opacity-50"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            How to tell me what you want
          </span>
          <h2
            className="uppercase leading-[0.9] tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 900,
              fontSize: "clamp(32px, 5vw, 56px)",
            }}
          >
            Copy any format:
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                h: "Pick one of each",
                p: "\"M05A + T02. Lock it.\"",
              },
              {
                h: "Mix + iterate",
                p: "\"M05 idea is right but render it heavier. Scripture: T02.\"",
              },
              {
                h: "Kill + request new",
                p: "\"Kill M03 entirely. Give me 3 more takes on M02.\"",
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
            FINDGOD / V4 · 5 monogram directions · 7 scripture types
          </p>
          <p className="text-xs opacity-40">
            Your job: narrow down. My job: lock and ship.
          </p>
        </div>
      </footer>
    </div>
  );
}
