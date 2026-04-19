import {
  Archivo,
  Inter,
  Anton,
  Space_Grotesk,
  JetBrains_Mono,
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
  variable: "--font-space-grotesk",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

type Swatch = { name: string; hex: string };

function ColorRow({ swatches }: { swatches: Swatch[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {swatches.map((s) => (
        <div key={s.hex} className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-full border border-white/10"
            style={{ background: s.hex }}
          />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest opacity-60">
              {s.name}
            </span>
            <span
              className="text-[11px] opacity-80"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              {s.hex}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConceptHeader({
  number,
  name,
  description,
}: {
  number: string;
  name: string;
  description: string;
}) {
  return (
    <div
      className="flex items-baseline gap-4"
      style={{ fontFamily: "var(--font-jetbrains)" }}
    >
      <span className="text-xs uppercase tracking-[0.3em] opacity-40">
        Concept {number}
      </span>
      <span className="text-xs uppercase tracking-[0.2em] opacity-60">
        {name}
      </span>
      <div className="h-px flex-1 bg-current opacity-10" />
      <span className="hidden text-xs opacity-40 sm:block">
        {description}
      </span>
    </div>
  );
}

function ConceptFooter({
  palette,
  fonts,
  mood,
  references,
}: {
  palette: Swatch[];
  fonts: string[];
  mood: string[];
  references: string[];
}) {
  return (
    <div className="relative z-10 grid gap-8 border-t border-current pt-6 opacity-90 sm:grid-cols-4">
      <div className="flex flex-col gap-3">
        <span
          className="text-[10px] uppercase tracking-[0.25em] opacity-60"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          Palette
        </span>
        <ColorRow swatches={palette} />
      </div>
      <div className="flex flex-col gap-3">
        <span
          className="text-[10px] uppercase tracking-[0.25em] opacity-60"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          Typography
        </span>
        <div className="flex flex-col gap-1 text-sm opacity-90">
          {fonts.map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <span
          className="text-[10px] uppercase tracking-[0.25em] opacity-60"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          Mood
        </span>
        <div
          className="flex flex-wrap gap-x-5 gap-y-2"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          {mood.map((m) => (
            <span
              key={m}
              className="text-[11px] uppercase tracking-[0.25em] opacity-70"
            >
              {m}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <span
          className="text-[10px] uppercase tracking-[0.25em] opacity-60"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          References
        </span>
        <div className="flex flex-col gap-1 text-xs opacity-80">
          {references.map((r) => (
            <span key={r}>· {r}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ConceptsV2Page() {
  return (
    <div
      className={`${archivo.variable} ${inter.variable} ${anton.variable} ${spaceGrotesk.variable} ${jetbrains.variable} min-h-screen bg-black text-white`}
      style={{ fontFamily: "var(--font-inter)" }}
    >
      {/* TOP BAR */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 px-6 py-4 backdrop-blur-md sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span
            className="text-sm uppercase tracking-[0.3em] opacity-60"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            FINDGOD / Brand V2 · Streetwear Iterations
          </span>
          <a
            href="/concepts"
            className="text-xs uppercase tracking-[0.2em] opacity-40 hover:opacity-80"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            ← v1
          </a>
        </div>
      </header>

      {/* ============ CONCEPT 06 — THE ESSENTIALS ============ */}
      <section
        className="relative flex min-h-screen flex-col justify-between overflow-hidden px-6 py-20 sm:px-14 sm:py-24"
        style={{
          background: "#000000",
          color: "#F0EDE6",
        }}
      >
        {/* Subtle noise */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative z-10">
          <ConceptHeader
            number="06"
            name="The Essentials"
            description="Fear of God level minimalism · no clutter"
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-14 py-12">
          <h1
            className="w-full text-center uppercase leading-[0.85] tracking-[-0.03em]"
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 900,
              fontSize: "clamp(72px, 18vw, 260px)",
            }}
          >
            FINDGOD
          </h1>

          <div
            className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[11px] uppercase tracking-[0.4em] opacity-60 sm:text-xs"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            <span>Strength</span>
            <span className="opacity-30">◆</span>
            <span>Wisdom</span>
            <span className="opacity-30">◆</span>
            <span>Brotherhood</span>
            <span className="opacity-30">◆</span>
            <span>Truth</span>
          </div>
        </div>

        <ConceptFooter
          palette={[
            { name: "Jet", hex: "#000000" },
            { name: "Bone", hex: "#F0EDE6" },
            { name: "Stone", hex: "#8B8680" },
            { name: "Ash", hex: "#1F1F1F" },
          ]}
          fonts={[
            "Archivo Black — wordmark",
            "JetBrains Mono — UI labels",
            "Inter — body (unused here)",
          ]}
          mood={["Minimal", "Premium", "Essential", "Quiet-Confident", "Uncompromising"]}
          references={[
            "Fear of God Essentials lookbook",
            "Stussy wordmark drops",
            "Aimé Leon Dore storefront",
          ]}
        />
      </section>

      {/* ============ CONCEPT 07 — THE DROP (Yeezy Season) ============ */}
      <section
        className="relative flex min-h-screen flex-col justify-between overflow-hidden px-6 py-20 sm:px-14 sm:py-24"
        style={{
          background: "#C9BDA9",
          color: "#1A1814",
        }}
      >
        <div className="relative z-10">
          <ConceptHeader
            number="07"
            name="The Drop"
            description="Yeezy Season catalogue palette · warm neutrals"
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-12 py-12 sm:flex-row sm:items-end sm:gap-6">
          {/* Left: massive wordmark */}
          <div className="flex flex-1 flex-col gap-4">
            <span
              className="text-[10px] uppercase tracking-[0.35em] opacity-60"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Season 01 / Drop 001
            </span>
            <h1
              className="uppercase leading-[0.85] tracking-[-0.03em]"
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 900,
                fontSize: "clamp(72px, 14vw, 200px)",
              }}
            >
              FINDGOD
            </h1>
            <div className="h-px w-full bg-black/20" />
            <p
              className="text-sm uppercase tracking-[0.2em] opacity-80"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              For the man done with the noise.
              <br />
              Launching MMXXVI.
            </p>
          </div>

          {/* Right: metadata column */}
          <div className="flex w-full flex-col gap-6 sm:w-64">
            {[
              { label: "Category", value: "Streetwear + Faith" },
              { label: "Audience", value: "Men · 16-30" },
              { label: "Colorway", value: "Bone / Umber / Jet" },
              { label: "Release", value: "TBD" },
            ].map((row) => (
              <div key={row.label} className="flex flex-col gap-1">
                <span
                  className="text-[10px] uppercase tracking-[0.3em] opacity-50"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {row.label}
                </span>
                <span className="text-sm">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <ConceptFooter
          palette={[
            { name: "Taupe", hex: "#C9BDA9" },
            { name: "Ink", hex: "#1A1814" },
            { name: "Umber", hex: "#4A3A2E" },
            { name: "Dust", hex: "#A89E8A" },
          ]}
          fonts={[
            "Archivo Black — wordmark",
            "JetBrains Mono — labels",
            "Inter — body",
          ]}
          mood={["Warm", "Lookbook", "Seasoned", "Editorial", "Premium"]}
          references={[
            "Yeezy Season catalogue covers",
            "Aimé Leon Dore campaign layouts",
            "Fear of God Main Line lookbook",
          ]}
        />
      </section>

      {/* ============ CONCEPT 08 — THE ANTHEM (Nike/Jordan) ============ */}
      <section
        className="relative flex min-h-screen flex-col justify-between overflow-hidden px-6 py-20 sm:px-14 sm:py-24"
        style={{
          background: "#000000",
          color: "#FFFFFF",
        }}
      >
        <div className="relative z-10">
          <ConceptHeader
            number="08"
            name="The Anthem"
            description="Jordan campaign · stacked condensed type"
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 py-12">
          <h1
            className="uppercase leading-[0.8] tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-anton)",
              fontSize: "clamp(100px, 22vw, 320px)",
            }}
          >
            FIND
            <br />
            GOD.
          </h1>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <p
              className="max-w-sm text-base uppercase leading-relaxed tracking-[0.15em] opacity-80"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Strength. Wisdom. Brotherhood. Truth.
              <br />
              For the man ready to stop performing.
            </p>
            <span
              className="text-xs uppercase tracking-[0.3em] opacity-50"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              A movement · not a merch line
            </span>
          </div>
        </div>

        <ConceptFooter
          palette={[
            { name: "Jet", hex: "#000000" },
            { name: "Chalk", hex: "#FFFFFF" },
            { name: "Concrete", hex: "#7A7A7A" },
            { name: "Ink", hex: "#0F0F0F" },
          ]}
          fonts={[
            "Anton — display (massive condensed)",
            "JetBrains Mono — UI labels",
            "Inter — body",
          ]}
          mood={["Campaign", "Anthem", "Loud", "Declarative", "Athletic"]}
          references={[
            "Nike Jordan campaign print",
            "Off-White runway graphics",
            "Supreme Box Logo campaigns",
          ]}
        />
      </section>

      {/* ============ CONCEPT 09 — THE MONOGRAM PAIR ============ */}
      <section
        className="relative flex min-h-screen flex-col justify-between overflow-hidden px-6 py-20 sm:px-14 sm:py-24"
        style={{
          background: "#000000",
          color: "#F0EDE6",
        }}
      >
        <div className="relative z-10">
          <ConceptHeader
            number="09"
            name="The Monogram Pair"
            description="Wordmark + mark · for merch use"
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 py-12">
          {/* TOP: Wordmark */}
          <div className="flex flex-col gap-4">
            <span
              className="text-[10px] uppercase tracking-[0.3em] opacity-50"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              01 · Primary wordmark — use on hero areas, merch back hits
            </span>
            <h1
              className="uppercase leading-[0.85] tracking-[-0.03em]"
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 900,
                fontSize: "clamp(72px, 14vw, 200px)",
              }}
            >
              FINDGOD
            </h1>
          </div>

          <div className="h-px w-full bg-white/10" />

          {/* BOTTOM: Monogram mark placeholder */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4">
              <span
                className="text-[10px] uppercase tracking-[0.3em] opacity-50"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                02 · Monogram mark — use on hats, tags, favicon, avatar
              </span>
              <p className="max-w-md text-sm opacity-70">
                Designer brief: An interlocking
                <span
                  className="mx-1"
                  style={{
                    fontFamily: "var(--font-archivo)",
                    fontWeight: 900,
                  }}
                >
                  F
                </span>
                and
                <span
                  className="mx-1"
                  style={{
                    fontFamily: "var(--font-archivo)",
                    fontWeight: 900,
                  }}
                >
                  G
                </span>
                in a shield silhouette. Gothic-serif letterforms. Must work
                stamped on leather, embroidered on a cap, and at 24px favicon.
              </p>
            </div>

            {/* Placeholder monogram box */}
            <div className="flex h-56 w-56 flex-col items-center justify-center gap-3 border border-white/30">
              <span
                className="uppercase leading-none"
                style={{
                  fontFamily: "var(--font-archivo)",
                  fontWeight: 900,
                  fontSize: "110px",
                  letterSpacing: "-0.1em",
                }}
              >
                FG
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.3em] opacity-50"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                designer placeholder
              </span>
            </div>
          </div>
        </div>

        <ConceptFooter
          palette={[
            { name: "Jet", hex: "#000000" },
            { name: "Bone", hex: "#F0EDE6" },
            { name: "Gold thread", hex: "#C4A87C" },
            { name: "Stone", hex: "#8B8680" },
          ]}
          fonts={[
            "Archivo Black — wordmark + mark",
            "JetBrains Mono — labels",
            "Inter — body",
          ]}
          mood={["Branded", "Systematic", "Mark-driven", "Merchable", "Iconic"]}
          references={[
            "Nike swoosh + wordmark system",
            "Yeezy brand stamps",
            "Chrome Hearts monogram usage",
          ]}
        />
      </section>

      {/* ============ CONCEPT 10 — THE MANIFESTO ============ */}
      <section
        className="relative flex min-h-screen flex-col justify-between overflow-hidden px-6 py-20 sm:px-14 sm:py-24"
        style={{
          background: "#000000",
          color: "#F0EDE6",
        }}
      >
        <div className="relative z-10">
          <ConceptHeader
            number="10"
            name="The Manifesto"
            description="Words are the brand · type-only"
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 py-12">
          <h1
            className="uppercase leading-[0.95] tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 900,
              fontSize: "clamp(48px, 10vw, 140px)",
            }}
          >
            For the man
            <br />
            <span className="opacity-30">who was</span>
            <br />
            built for more
            <br />
            <span className="opacity-30">than this.</span>
          </h1>

          <div className="mt-6 flex flex-col gap-2">
            <div className="h-px w-12 bg-white/30" />
            <p
              className="text-sm uppercase tracking-[0.25em] opacity-70"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Findgod — masculine biblical wisdom, delivered.
            </p>
          </div>
        </div>

        <ConceptFooter
          palette={[
            { name: "Jet", hex: "#000000" },
            { name: "Bone", hex: "#F0EDE6" },
            { name: "Bone (30%)", hex: "#F0EDE64D" },
            { name: "Line", hex: "#FFFFFF1A" },
          ]}
          fonts={[
            "Archivo Black — manifesto",
            "JetBrains Mono — signature line",
            "Inter — body",
          ]}
          mood={["Declarative", "Editorial", "Bold", "Typographic", "Content-first"]}
          references={[
            "Nike manifesto ads (1989-present)",
            "Stripe Press book jackets",
            "Jay-Z Decoded typography",
          ]}
        />
      </section>

      {/* ============ WHAT CHANGED FROM V1 ============ */}
      <section
        className="border-t border-white/10 bg-black px-6 py-16 text-white sm:px-14"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <div className="flex flex-col gap-2">
            <span
              className="text-[10px] uppercase tracking-[0.3em] opacity-50"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              What changed vs v1
            </span>
            <h2
              className="uppercase leading-[0.9] tracking-[-0.02em]"
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 900,
                fontSize: "clamp(32px, 5vw, 64px)",
              }}
            >
              All 5 live inside
              <br />
              your streetwear zone.
            </h2>
          </div>

          <ul
            className="grid gap-6 sm:grid-cols-2"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {[
              {
                h: "Warm neutrals, not pure white",
                p: "Per Yeezy Season data — premium merch text is bone / taupe, never #FFFFFF.",
              },
              {
                h: "Oversized type as the star",
                p: "2025-2026 streetwear data: 'oversized fonts dominate, turning text into the design.'",
              },
              {
                h: "No tiny type (you flagged this)",
                p: "Anton used at massive scale in Concept 08 replaces the small Oswald from v1 Warrior.",
              },
              {
                h: "Shown with real brand references",
                p: "Every concept lists the brands it's rooted in — not AI vibes, proven templates.",
              },
              {
                h: "Wordmark + mark pair addressed",
                p: "Concept 09 shows how the brand works on a hat vs a hoodie — the actual merch use case.",
              },
              {
                h: "Manifesto option added",
                p: "Concept 10 makes the WORDS the design — like Nike's classic manifesto ads.",
              },
            ].map((item) => (
              <li key={item.h} className="flex flex-col gap-1">
                <span
                  className="text-sm uppercase tracking-[0.15em] opacity-90"
                  style={{
                    fontFamily: "var(--font-archivo)",
                    fontWeight: 900,
                  }}
                >
                  {item.h}
                </span>
                <span className="text-sm opacity-60">{item.p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="border-t border-white/10 bg-black px-6 py-10 text-white sm:px-14"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="text-xs uppercase tracking-[0.3em] opacity-50"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            FINDGOD / V2 Brand Iterations
          </p>
          <p className="text-xs opacity-40">
            Which one (or blend) feels most FINDGOD to you?
          </p>
        </div>
      </footer>
    </div>
  );
}
