import {
  Archivo,
  Inter,
  Anton,
  Space_Grotesk,
  JetBrains_Mono,
  Instrument_Serif,
} from "next/font/google";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "900"],
  variable: "--font-archivo",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
});

type Swatch = { name: string; hex: string };

function Palette({ swatches }: { swatches: Swatch[] }) {
  return (
    <div className="flex gap-1.5">
      {swatches.map((s) => (
        <div
          key={s.hex}
          className="h-5 w-5 rounded-full border"
          style={{
            background: s.hex,
            borderColor: "rgba(255,255,255,0.15)",
          }}
          title={`${s.name} · ${s.hex}`}
        />
      ))}
    </div>
  );
}

function VariationLabel({
  id,
  note,
}: {
  id: string;
  note: string;
}) {
  return (
    <div
      className="flex items-baseline justify-between gap-3 border-b border-current pb-2 opacity-80"
      style={{ fontFamily: "var(--font-jetbrains)" }}
    >
      <span className="text-[10px] uppercase tracking-[0.3em]">{id}</span>
      <span className="text-[10px] uppercase tracking-[0.15em] opacity-70">
        {note}
      </span>
    </div>
  );
}

function FamilyHeader({
  number,
  name,
  description,
  references,
}: {
  number: string;
  name: string;
  description: string;
  references: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/10 pb-6">
      <div
        className="flex items-baseline gap-4"
        style={{ fontFamily: "var(--font-jetbrains)" }}
      >
        <span className="text-xs uppercase tracking-[0.3em] opacity-50">
          Family {number}
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <h2
        className="uppercase leading-[0.9] tracking-[-0.02em]"
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 900,
          fontSize: "clamp(32px, 5vw, 56px)",
        }}
      >
        {name}
      </h2>
      <p className="max-w-2xl text-sm opacity-60">{description}</p>
      <p
        className="text-[10px] uppercase tracking-[0.25em] opacity-40"
        style={{ fontFamily: "var(--font-jetbrains)" }}
      >
        References: {references}
      </p>
    </div>
  );
}

/* ============================================================
   SHARED CARD WRAPPER
   ============================================================ */

function Card({
  bg,
  fg,
  children,
}: {
  bg: string;
  fg: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex min-h-[440px] flex-col justify-between overflow-hidden rounded-lg border border-white/10 p-6"
      style={{ background: bg, color: fg }}
    >
      {children}
    </div>
  );
}

/* ============================================================
   FAMILY 06 — THE ESSENTIALS
   ============================================================ */

function Family06() {
  return (
    <section className="flex flex-col gap-8">
      <FamilyHeader
        number="06"
        name="The Essentials"
        description="Minimalism. The wordmark IS the design. No decoration, no ornament — just scale, weight, and generous silence around it."
        references="Fear of God Essentials, Stussy wordmark drops, Aimé Leon Dore"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {/* 06A — Centered classic */}
        <Card bg="#000000" fg="#F0EDE6">
          <VariationLabel id="06A" note="Centered · classic" />
          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            <span
              className="text-center uppercase leading-[0.85] tracking-[-0.03em]"
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 900,
                fontSize: "clamp(48px, 6vw, 72px)",
              }}
            >
              FINDGOD
            </span>
            <div
              className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[9px] uppercase tracking-[0.35em] opacity-60"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              <span>Strength</span>
              <span className="opacity-30">◆</span>
              <span>Wisdom</span>
              <span className="opacity-30">◆</span>
              <span>Truth</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <Palette
              swatches={[
                { name: "Jet", hex: "#000000" },
                { name: "Bone", hex: "#F0EDE6" },
                { name: "Stone", hex: "#8B8680" },
              ]}
            />
            <span
              className="opacity-50"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Archivo Black
            </span>
          </div>
        </Card>

        {/* 06B — Left-aligned confident */}
        <Card bg="#000000" fg="#F0EDE6">
          <VariationLabel id="06B" note="Left-aligned · confident" />
          <div className="flex flex-1 flex-col justify-center gap-5">
            <span
              className="uppercase leading-[0.85] tracking-[-0.04em]"
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 900,
                fontSize: "clamp(52px, 7vw, 84px)",
              }}
            >
              FINDGOD
            </span>
            <div
              className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] opacity-70"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              <span className="h-px w-6 bg-current" />
              <span>Est. MMXXVI</span>
            </div>
            <p className="text-xs uppercase tracking-[0.15em] opacity-50">
              For the man done with the noise.
            </p>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <Palette
              swatches={[
                { name: "Jet", hex: "#000000" },
                { name: "Bone", hex: "#F0EDE6" },
                { name: "Stone", hex: "#8B8680" },
              ]}
            />
            <span
              className="opacity-50"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Archivo Black
            </span>
          </div>
        </Card>

        {/* 06C — Stamped / stacked */}
        <Card bg="#000000" fg="#F0EDE6">
          <VariationLabel id="06C" note="Stamped · two-line stack" />
          <div className="flex flex-1 flex-col items-center justify-center gap-1">
            <span
              className="uppercase leading-[0.85] tracking-[-0.04em]"
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 900,
                fontSize: "clamp(60px, 8vw, 96px)",
              }}
            >
              FIND
            </span>
            <span
              className="uppercase leading-[0.85] tracking-[-0.04em]"
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 900,
                fontSize: "clamp(60px, 8vw, 96px)",
              }}
            >
              GOD
            </span>
            <span
              className="mt-4 text-[9px] uppercase tracking-[0.4em] opacity-60"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              · · · · ·
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <Palette
              swatches={[
                { name: "Jet", hex: "#000000" },
                { name: "Bone", hex: "#F0EDE6" },
                { name: "Stone", hex: "#8B8680" },
              ]}
            />
            <span
              className="opacity-50"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Archivo Black
            </span>
          </div>
        </Card>
      </div>
    </section>
  );
}

/* ============================================================
   FAMILY 07 — THE DROP (Yeezy Season warm neutrals)
   ============================================================ */

function Family07() {
  return (
    <section className="flex flex-col gap-8">
      <FamilyHeader
        number="07"
        name="The Drop"
        description="Warm neutral palettes borrowed from Yeezy Season catalogues. Feels more like premium apparel season than a tech brand."
        references="Yeezy Season catalogue, Aimé Leon Dore, Fear of God Main Line"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {/* 07A — Taupe bg, ink text */}
        <Card bg="#C9BDA9" fg="#1A1814">
          <VariationLabel id="07A" note="Taupe field · ink text" />
          <div className="flex flex-1 flex-col justify-center gap-4">
            <span
              className="text-[9px] uppercase tracking-[0.4em] opacity-60"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Season 01 / Drop 001
            </span>
            <span
              className="uppercase leading-[0.85] tracking-[-0.03em]"
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 900,
                fontSize: "clamp(48px, 7vw, 76px)",
              }}
            >
              FINDGOD
            </span>
            <div className="h-px w-full bg-black/20" />
            <p
              className="text-[10px] uppercase tracking-[0.2em] opacity-70"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Launching MMXXVI
            </p>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <Palette
              swatches={[
                { name: "Taupe", hex: "#C9BDA9" },
                { name: "Ink", hex: "#1A1814" },
                { name: "Umber", hex: "#4A3A2E" },
              ]}
            />
            <span
              className="opacity-50"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Archivo Black
            </span>
          </div>
        </Card>

        {/* 07B — Charcoal bg, bone text, taupe accent */}
        <Card bg="#1F1C18" fg="#E8E0CC">
          <VariationLabel id="07B" note="Charcoal field · warm bone" />
          <div className="flex flex-1 flex-col justify-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ background: "#C9BDA9" }}
              />
              <span
                className="text-[9px] uppercase tracking-[0.4em] opacity-60"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                Season 01
              </span>
            </div>
            <span
              className="uppercase leading-[0.85] tracking-[-0.03em]"
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 900,
                fontSize: "clamp(48px, 7vw, 76px)",
              }}
            >
              FINDGOD
            </span>
            <p
              className="text-[10px] uppercase tracking-[0.2em] opacity-70"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Inverted colorway · same lookbook energy
            </p>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <Palette
              swatches={[
                { name: "Charcoal", hex: "#1F1C18" },
                { name: "Bone", hex: "#E8E0CC" },
                { name: "Taupe", hex: "#C9BDA9" },
              ]}
            />
            <span
              className="opacity-50"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Archivo Black
            </span>
          </div>
        </Card>

        {/* 07C — Stone bg (lightest) */}
        <Card bg="#EFE8DA" fg="#1A1814">
          <VariationLabel id="07C" note="Stone field · paper feel" />
          <div className="flex flex-1 flex-col justify-center gap-4">
            <span
              className="text-[9px] uppercase tracking-[0.4em] opacity-60"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Vol. 1 / No. 001
            </span>
            <span
              className="uppercase leading-[0.85] tracking-[-0.03em]"
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 900,
                fontSize: "clamp(48px, 7vw, 76px)",
              }}
            >
              FINDGOD
            </span>
            <p
              className="max-w-xs text-[11px] leading-relaxed opacity-70"
              style={{ fontFamily: "var(--font-instrument)", fontStyle: "italic" }}
            >
              A quarterly word for the man
              <br />
              who is done with the noise.
            </p>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <Palette
              swatches={[
                { name: "Stone", hex: "#EFE8DA" },
                { name: "Ink", hex: "#1A1814" },
                { name: "Umber", hex: "#4A3A2E" },
              ]}
            />
            <span
              className="opacity-50"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Archivo + Instrument
            </span>
          </div>
        </Card>
      </div>
    </section>
  );
}

/* ============================================================
   FAMILY 08 — THE ANTHEM (Nike Jordan campaign condensed)
   ============================================================ */

function Family08() {
  return (
    <section className="flex flex-col gap-8">
      <FamilyHeader
        number="08"
        name="The Anthem"
        description="Ultra-tall condensed typography. Nike/Jordan campaign energy — the type IS the anthem. Big, sharp, declarative."
        references="Nike Jordan campaign, Off-White runway graphics, Supreme box logo"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {/* 08A — Stacked FIND / GOD. */}
        <Card bg="#000000" fg="#FFFFFF">
          <VariationLabel id="08A" note="Stacked · classic campaign" />
          <div className="flex flex-1 items-center justify-start">
            <span
              className="uppercase leading-[0.8] tracking-[-0.02em]"
              style={{
                fontFamily: "var(--font-anton)",
                fontSize: "clamp(80px, 12vw, 130px)",
              }}
            >
              FIND
              <br />
              GOD.
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <Palette
              swatches={[
                { name: "Jet", hex: "#000000" },
                { name: "Chalk", hex: "#FFFFFF" },
                { name: "Concrete", hex: "#7A7A7A" },
              ]}
            />
            <span
              className="opacity-50"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Anton
            </span>
          </div>
        </Card>

        {/* 08B — Single line horizontal stretch */}
        <Card bg="#000000" fg="#FFFFFF">
          <VariationLabel id="08B" note="Single line · stretched" />
          <div className="flex flex-1 items-center justify-center">
            <span
              className="text-center uppercase leading-[1] tracking-[0.04em]"
              style={{
                fontFamily: "var(--font-anton)",
                fontSize: "clamp(36px, 5vw, 60px)",
              }}
            >
              FINDGOD
            </span>
          </div>
          <div
            className="flex items-center justify-center gap-3 text-[9px] uppercase tracking-[0.4em] opacity-60"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            <span className="h-px w-8 bg-current" />
            <span>For the brothers</span>
            <span className="h-px w-8 bg-current" />
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <Palette
              swatches={[
                { name: "Jet", hex: "#000000" },
                { name: "Chalk", hex: "#FFFFFF" },
                { name: "Concrete", hex: "#7A7A7A" },
              ]}
            />
            <span
              className="opacity-50"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Anton
            </span>
          </div>
        </Card>

        {/* 08C — Broken / lined words */}
        <Card bg="#000000" fg="#FFFFFF">
          <VariationLabel id="08C" note="Lined words · broken rhythm" />
          <div className="flex flex-1 flex-col justify-center gap-2">
            <div className="flex items-center gap-3">
              <span
                className="uppercase leading-[0.8] tracking-[-0.02em]"
                style={{
                  fontFamily: "var(--font-anton)",
                  fontSize: "clamp(56px, 8vw, 96px)",
                }}
              >
                FIND.
              </span>
              <div className="h-16 flex-1 border-t border-white/40" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 border-t border-white/40" />
              <span
                className="uppercase leading-[0.8] tracking-[-0.02em]"
                style={{
                  fontFamily: "var(--font-anton)",
                  fontSize: "clamp(56px, 8vw, 96px)",
                }}
              >
                GOD.
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <Palette
              swatches={[
                { name: "Jet", hex: "#000000" },
                { name: "Chalk", hex: "#FFFFFF" },
                { name: "Concrete", hex: "#7A7A7A" },
              ]}
            />
            <span
              className="opacity-50"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Anton
            </span>
          </div>
        </Card>
      </div>
    </section>
  );
}

/* ============================================================
   FAMILY 09 — THE MONOGRAM PAIR
   ============================================================ */

function Family09() {
  return (
    <section className="flex flex-col gap-8">
      <FamilyHeader
        number="09"
        name="The Monogram Pair"
        description="Every great brand has a secondary mark — a symbol you can wear on a hat without the full name. Three directions for how FG gets treated as a standalone mark."
        references="Nike swoosh system, Yeezy brand stamps, Chrome Hearts monogram"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {/* 09A — Shield box */}
        <Card bg="#000000" fg="#F0EDE6">
          <VariationLabel id="09A" note="Shield · stamped letterpress" />
          <div className="flex flex-1 items-center justify-center">
            <div className="flex h-40 w-40 flex-col items-center justify-center gap-2 border-2 border-current">
              <span
                className="uppercase leading-none"
                style={{
                  fontFamily: "var(--font-archivo)",
                  fontWeight: 900,
                  fontSize: "80px",
                  letterSpacing: "-0.08em",
                }}
              >
                FG
              </span>
              <span
                className="text-[8px] uppercase tracking-[0.3em] opacity-60"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                FINDGOD
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <Palette
              swatches={[
                { name: "Jet", hex: "#000000" },
                { name: "Bone", hex: "#F0EDE6" },
                { name: "Gold", hex: "#C4A87C" },
              ]}
            />
            <span
              className="opacity-50"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              hat · tag · favicon
            </span>
          </div>
        </Card>

        {/* 09B — Circle seal */}
        <Card bg="#000000" fg="#F0EDE6">
          <VariationLabel id="09B" note="Seal · circle monogram" />
          <div className="flex flex-1 items-center justify-center">
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-2 border-current">
              <span
                className="uppercase leading-none"
                style={{
                  fontFamily: "var(--font-archivo)",
                  fontWeight: 900,
                  fontSize: "72px",
                  letterSpacing: "-0.08em",
                }}
              >
                FG
              </span>
              <span
                className="absolute -bottom-1 flex w-full justify-center gap-3 text-[7px] uppercase tracking-[0.4em] opacity-60"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                <span className="bg-black px-1">MMXXVI</span>
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <Palette
              swatches={[
                { name: "Jet", hex: "#000000" },
                { name: "Bone", hex: "#F0EDE6" },
                { name: "Gold", hex: "#C4A87C" },
              ]}
            />
            <span
              className="opacity-50"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              embroidered cap
            </span>
          </div>
        </Card>

        {/* 09C — Bare glyph no frame */}
        <Card bg="#000000" fg="#F0EDE6">
          <VariationLabel id="09C" note="Bare glyph · no frame" />
          <div className="flex flex-1 items-center justify-center">
            <span
              className="uppercase leading-none"
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 900,
                fontSize: "160px",
                letterSpacing: "-0.12em",
              }}
            >
              FG
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <Palette
              swatches={[
                { name: "Jet", hex: "#000000" },
                { name: "Bone", hex: "#F0EDE6" },
                { name: "Gold", hex: "#C4A87C" },
              ]}
            />
            <span
              className="opacity-50"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              minimal · chest hit
            </span>
          </div>
        </Card>
      </div>
    </section>
  );
}

/* ============================================================
   FAMILY 10 — THE MANIFESTO
   ============================================================ */

function Family10() {
  return (
    <section className="flex flex-col gap-8">
      <FamilyHeader
        number="10"
        name="The Manifesto"
        description="Words are the brand. Type-only treatments where the message does the work and the wordmark becomes a signature at the end."
        references="Nike manifesto ads, Stripe Press jackets, Jay-Z Decoded"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {/* 10A — Alternating emphasis */}
        <Card bg="#000000" fg="#F0EDE6">
          <VariationLabel id="10A" note="Alternating emphasis" />
          <div className="flex flex-1 flex-col justify-center">
            <h3
              className="uppercase leading-[0.95] tracking-[-0.02em]"
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 900,
                fontSize: "clamp(28px, 4vw, 44px)",
              }}
            >
              For the man
              <br />
              <span className="opacity-30">who was</span>
              <br />
              built for more
              <br />
              <span className="opacity-30">than this.</span>
            </h3>
          </div>
          <div className="flex flex-col gap-2 pt-4">
            <div className="h-px w-10 bg-white/30" />
            <span
              className="text-[10px] uppercase tracking-[0.3em] opacity-70"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              — FINDGOD
            </span>
          </div>
        </Card>

        {/* 10B — Brute force all bold */}
        <Card bg="#000000" fg="#F0EDE6">
          <VariationLabel id="10B" note="Brute force · all bold" />
          <div className="flex flex-1 flex-col justify-center">
            <h3
              className="uppercase leading-[0.95] tracking-[-0.02em]"
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 900,
                fontSize: "clamp(28px, 4vw, 44px)",
              }}
            >
              Built for
              <br />
              war.
              <br />
              Called to
              <br />
              rest.
            </h3>
          </div>
          <div className="flex flex-col gap-2 pt-4">
            <div className="h-px w-10 bg-white/30" />
            <span
              className="text-[10px] uppercase tracking-[0.3em] opacity-70"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              — FINDGOD
            </span>
          </div>
        </Card>

        {/* 10C — Bold + serif scripture */}
        <Card bg="#000000" fg="#F0EDE6">
          <VariationLabel id="10C" note="Bold + serif scripture" />
          <div className="flex flex-1 flex-col justify-center gap-5">
            <h3
              className="uppercase leading-[0.95] tracking-[-0.02em]"
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 900,
                fontSize: "clamp(28px, 4vw, 40px)",
              }}
            >
              Act like men.
              <br />
              Be strong.
            </h3>
            <p
              className="max-w-xs text-sm italic leading-relaxed opacity-80"
              style={{ fontFamily: "var(--font-instrument)" }}
            >
              &ldquo;Be watchful, stand firm in the faith…&rdquo;
              <span className="mt-1 block text-[10px] not-italic uppercase tracking-[0.25em] opacity-60">
                1 Corinthians 16:13
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-4">
            <div className="h-px w-10 bg-white/30" />
            <span
              className="text-[10px] uppercase tracking-[0.3em] opacity-70"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              — FINDGOD
            </span>
          </div>
        </Card>
      </div>
    </section>
  );
}

/* ============================================================
   PAGE
   ============================================================ */

export default function ConceptsV3Page() {
  return (
    <div
      className={`${archivo.variable} ${inter.variable} ${anton.variable} ${spaceGrotesk.variable} ${jetbrains.variable} ${instrument.variable} min-h-screen bg-black text-white`}
      style={{ fontFamily: "var(--font-inter)" }}
    >
      {/* TOP BAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 px-6 py-4 backdrop-blur-md sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <span
            className="text-xs uppercase tracking-[0.3em] opacity-70 sm:text-sm"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            FINDGOD / Brand V3 · Variations per family
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
            How to use this page
          </span>
          <h1
            className="uppercase leading-[0.9] tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 900,
              fontSize: "clamp(40px, 6vw, 72px)",
            }}
          >
            5 families.
            <br />
            3 variations each.
            <br />
            15 in total.
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed opacity-70">
            Every variation is labeled (06A, 06B, 06C, etc.). Scroll through a
            family row to compare versions within that direction, then compare
            across families. Tell me the IDs you like — you can mix and match
            (e.g., &ldquo;08A&rsquo;s type + 07B&rsquo;s palette + 09C&rsquo;s
            monogram&rdquo;). Nothing is final until you lock it.
          </p>
        </div>
      </section>

      {/* FAMILIES */}
      <div className="flex flex-col gap-24 px-6 py-20 sm:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-24">
          <Family06 />
          <Family07 />
          <Family08 />
          <Family09 />
          <Family10 />
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
            Copy any format that fits:
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                h: "Single winner",
                p: "\"08A is it. Lock it.\"",
              },
              {
                h: "Mix and match",
                p: "\"Wordmark from 06B + palette from 07B + monogram 09A.\"",
              },
              {
                h: "Narrow + iterate",
                p: "\"Love 10A and 10C. Kill all of 09. Give me 3 more on family 10.\"",
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
            FINDGOD / V3 · 15 Variations
          </p>
          <p className="text-xs opacity-40">
            Your job: narrow down. My job: lock and ship.
          </p>
        </div>
      </footer>
    </div>
  );
}
