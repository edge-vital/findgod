import {
  Fraunces,
  Inter,
  Oswald,
  Instrument_Serif,
  Archivo,
  Libre_Caslon_Text,
  JetBrains_Mono,
} from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-oswald",
});
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
});
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "900"],
  variable: "--font-archivo",
});
const libreCaslon = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-libre-caslon",
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
            <span className="font-mono text-[11px] opacity-80">{s.hex}</span>
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
    <div className="flex items-baseline gap-4">
      <span className="font-mono text-xs uppercase tracking-[0.3em] opacity-40">
        Concept {number}
      </span>
      <span className="font-mono text-xs uppercase tracking-[0.2em] opacity-60">
        {name}
      </span>
      <div className="h-px flex-1 bg-current opacity-10" />
      <span className="hidden text-xs opacity-40 sm:block">
        {description}
      </span>
    </div>
  );
}

function MoodWords({ words }: { words: string[] }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {words.map((w) => (
        <span
          key={w}
          className="font-mono text-[11px] uppercase tracking-[0.25em] opacity-50"
        >
          {w}
        </span>
      ))}
    </div>
  );
}

export default function ConceptsPage() {
  return (
    <div
      className={`${fraunces.variable} ${inter.variable} ${oswald.variable} ${instrument.variable} ${archivo.variable} ${libreCaslon.variable} ${jetbrains.variable} min-h-screen bg-black text-white`}
      style={{ fontFamily: "var(--font-inter)" }}
    >
      {/* TOP INDEX */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 px-6 py-4 backdrop-blur-md sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span
            className="text-sm uppercase tracking-[0.3em] opacity-60"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            FINDGOD / Brand Directions
          </span>
          <span className="text-xs opacity-40">
            Internal · scroll through all 5
          </span>
        </div>
      </header>

      {/* ==================== CONCEPT 01 — THE MONASTERY ==================== */}
      <section
        className="relative flex min-h-screen flex-col justify-between overflow-hidden px-6 py-20 sm:px-14 sm:py-24"
        style={{
          background: "#050507",
          color: "#F0EDE6",
          fontFamily: "var(--font-inter)",
        }}
      >
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
          style={{
            background:
              "radial-gradient(circle, rgba(80,50,140,0.35) 0%, transparent 60%)",
          }}
        />
        {/* Dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10">
          <ConceptHeader
            number="01"
            name="The Monastery"
            description="Ancient · reverent · cinematic"
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-10 py-16 text-center">
          <div
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 backdrop-blur-sm"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] opacity-60">
              Masculine biblical wisdom
            </span>
          </div>

          <h1
            className="text-6xl font-light leading-[1] sm:text-7xl md:text-[120px]"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontWeight: 300,
              letterSpacing: "0.02em",
            }}
          >
            FINDGOD
          </h1>

          <p
            className="max-w-md text-lg opacity-60"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontStyle: "italic",
              fontWeight: 300,
            }}
          >
            Find the strength you were built for.
          </p>
        </div>

        <div className="relative z-10 grid gap-8 sm:grid-cols-[1fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-40">
              Palette
            </span>
            <ColorRow
              swatches={[
                { name: "Void Black", hex: "#050507" },
                { name: "Bone", hex: "#F0EDE6" },
                { name: "Gold", hex: "#C4A87C" },
                { name: "Indigo", hex: "#2D1B4E" },
              ]}
            />
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-40">
              Typography
            </span>
            <div className="flex flex-col gap-1 opacity-80">
              <span style={{ fontFamily: "var(--font-fraunces)" }} className="text-lg">
                Fraunces (Display)
              </span>
              <span className="text-sm">Inter (Body)</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-40">
              Mood
            </span>
            <MoodWords
              words={["Ancient", "Reverent", "Cinematic", "Forged", "Unshaken"]}
            />
          </div>
        </div>
      </section>

      {/* ==================== CONCEPT 02 — THE WARRIOR ==================== */}
      <section
        className="relative flex min-h-screen flex-col justify-between overflow-hidden px-6 py-20 sm:px-14 sm:py-24"
        style={{
          background: "#0A0A0A",
          color: "#E8E4DD",
          fontFamily: "var(--font-inter)",
        }}
      >
        {/* Film grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        {/* Red ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(155,45,32,0.25) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10">
          <ConceptHeader
            number="02"
            name="The Warrior"
            description="Forged · sharp · militaristic"
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-start gap-8 py-16">
          <div className="flex items-center gap-4">
            <div
              className="h-10 w-1"
              style={{ background: "#9B2D20" }}
            />
            <span
              className="text-xs uppercase tracking-[0.4em]"
              style={{ fontFamily: "var(--font-jetbrains)", color: "#9B2D20" }}
            >
              Be Strong / Act Like Men
            </span>
          </div>

          <h1
            className="text-7xl uppercase leading-[0.9] sm:text-8xl md:text-[140px]"
            style={{
              fontFamily: "var(--font-oswald)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Find
            <br />
            God.
          </h1>

          <p
            className="max-w-lg text-base uppercase tracking-[0.15em]"
            style={{
              fontFamily: "var(--font-jetbrains)",
              opacity: 0.7,
              lineHeight: 1.6,
            }}
          >
            &gt; Scripture that cuts. Brotherhood that forges.
            <br />
            &gt; For men done with the noise.
          </p>
        </div>

        <div className="relative z-10 grid gap-8 sm:grid-cols-[1fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <span
              className="text-[10px] uppercase tracking-[0.25em] opacity-40"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Palette
            </span>
            <ColorRow
              swatches={[
                { name: "Iron", hex: "#0A0A0A" },
                { name: "Bone", hex: "#E8E4DD" },
                { name: "Blood", hex: "#9B2D20" },
                { name: "Steel", hex: "#5C5C62" },
              ]}
            />
          </div>
          <div className="flex flex-col gap-3">
            <span
              className="text-[10px] uppercase tracking-[0.25em] opacity-40"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Typography
            </span>
            <div className="flex flex-col gap-1 opacity-80">
              <span
                style={{ fontFamily: "var(--font-oswald)", fontWeight: 700 }}
                className="text-lg uppercase"
              >
                OSWALD (DISPLAY)
              </span>
              <span
                style={{ fontFamily: "var(--font-jetbrains)" }}
                className="text-sm"
              >
                JetBrains Mono (UI)
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <span
              className="text-[10px] uppercase tracking-[0.25em] opacity-40"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Mood
            </span>
            <MoodWords
              words={["Forged", "Sharp", "Warrior", "Disciplined", "Unshaken"]}
            />
          </div>
        </div>
      </section>

      {/* ==================== CONCEPT 03 — THE EDITORIAL ==================== */}
      <section
        className="relative flex min-h-screen flex-col justify-between overflow-hidden px-6 py-20 sm:px-14 sm:py-24"
        style={{
          background: "#F2EEE5",
          color: "#1A1814",
          fontFamily: "var(--font-inter)",
        }}
      >
        <div className="relative z-10">
          <ConceptHeader
            number="03"
            name="The Editorial"
            description="Literary · timeless · quiet"
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-10 py-16 text-center">
          <span
            className="text-[10px] uppercase tracking-[0.35em]"
            style={{ color: "#8B6F3E" }}
          >
            No. 001 · Quarterly
          </span>

          <h1
            className="text-6xl leading-[1.05] sm:text-7xl md:text-[110px]"
            style={{
              fontFamily: "var(--font-instrument)",
              fontWeight: 400,
              letterSpacing: "-0.01em",
            }}
          >
            FINDGOD
          </h1>

          <div className="h-px w-16" style={{ background: "#8B6F3E" }} />

          <p
            className="max-w-md text-xl italic leading-relaxed"
            style={{
              fontFamily: "var(--font-instrument)",
              color: "#3A3530",
            }}
          >
            A quarterly word for the man
            <br />
            who is done with the noise.
          </p>
        </div>

        <div className="relative z-10 grid gap-8 sm:grid-cols-[1fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
              Palette
            </span>
            <ColorRow
              swatches={[
                { name: "Paper", hex: "#F2EEE5" },
                { name: "Ink", hex: "#1A1814" },
                { name: "Ochre", hex: "#8B6F3E" },
                { name: "Dust", hex: "#A89E8A" },
              ]}
            />
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
              Typography
            </span>
            <div className="flex flex-col gap-1 opacity-90">
              <span
                style={{ fontFamily: "var(--font-instrument)" }}
                className="text-lg"
              >
                Instrument Serif (Display)
              </span>
              <span className="text-sm">Inter (Body)</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
              Mood
            </span>
            <MoodWords
              words={[
                "Literary",
                "Timeless",
                "Quiet",
                "Considered",
                "Reverent",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ==================== CONCEPT 04 — THE STREETWEAR ==================== */}
      <section
        className="relative flex min-h-screen flex-col justify-between overflow-hidden px-6 py-20 sm:px-14 sm:py-24"
        style={{
          background: "#000000",
          color: "#FFFFFF",
          fontFamily: "var(--font-inter)",
        }}
      >
        {/* Subtle noise */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative z-10">
          <ConceptHeader
            number="04"
            name="The Streetwear"
            description="Premium · oversized · confident"
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 py-16">
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-[0.4em] opacity-50">
              Spring · MMXXVI
            </span>
            <div className="h-px flex-1 bg-white/15" />
          </div>

          <h1
            className="text-[96px] uppercase leading-[0.85] tracking-[-0.04em] sm:text-[160px] md:text-[220px]"
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 900,
            }}
          >
            FINDGOD
          </h1>

          <div className="flex items-start justify-between gap-10 pt-4">
            <p className="max-w-sm text-sm uppercase tracking-[0.15em] opacity-60">
              For men done with the noise.
              <br />
              Built for war. Called to rest.
            </p>
            <span className="text-xs uppercase tracking-[0.2em] opacity-40">
              Vol. 1 / Drop 001
            </span>
          </div>
        </div>

        <div className="relative z-10 grid gap-8 sm:grid-cols-[1fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-40">
              Palette
            </span>
            <ColorRow
              swatches={[
                { name: "Jet", hex: "#000000" },
                { name: "Chalk", hex: "#FFFFFF" },
                { name: "Stone", hex: "#8B8680" },
                { name: "Ash", hex: "#2A2A2A" },
              ]}
            />
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-40">
              Typography
            </span>
            <div className="flex flex-col gap-1 opacity-80">
              <span
                style={{ fontFamily: "var(--font-archivo)", fontWeight: 900 }}
                className="text-lg uppercase"
              >
                Archivo Black (Display)
              </span>
              <span className="text-sm">Inter (Body)</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-40">
              Mood
            </span>
            <MoodWords
              words={[
                "Premium",
                "Oversized",
                "Confident",
                "Modern",
                "Uncompromising",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ==================== CONCEPT 05 — THE CINEMATIC ==================== */}
      <section
        className="relative flex min-h-screen flex-col justify-between overflow-hidden px-6 py-20 sm:px-14 sm:py-24"
        style={{
          background:
            "linear-gradient(160deg, #1A0F08 0%, #0A0605 40%, #000000 100%)",
          color: "#E8DFC7",
          fontFamily: "var(--font-inter)",
        }}
      >
        {/* Bronze ambient */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] rounded-full blur-[140px]"
          style={{
            background:
              "radial-gradient(circle, rgba(184,134,67,0.2) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(61,30,20,0.4) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10">
          <ConceptHeader
            number="05"
            name="The Cinematic"
            description="Moody · painted · A24"
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-10 py-16 text-center">
          <span
            className="text-[10px] uppercase tracking-[0.4em]"
            style={{ color: "#B88643" }}
          >
            An Invitation
          </span>

          <h1
            className="text-6xl leading-[1] sm:text-7xl md:text-[100px]"
            style={{
              fontFamily: "var(--font-libre-caslon)",
              fontWeight: 400,
              fontStyle: "italic",
              letterSpacing: "-0.01em",
            }}
          >
            FindGod.
          </h1>

          <p
            className="max-w-md text-xl italic leading-relaxed opacity-80"
            style={{
              fontFamily: "var(--font-libre-caslon)",
            }}
          >
            Out of the deep.
            <br />
            Into the light.
          </p>
        </div>

        <div className="relative z-10 grid gap-8 sm:grid-cols-[1fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
              Palette
            </span>
            <ColorRow
              swatches={[
                { name: "Midnight", hex: "#0A0605" },
                { name: "Parchment", hex: "#E8DFC7" },
                { name: "Bronze", hex: "#B88643" },
                { name: "Rust", hex: "#3D1E14" },
              ]}
            />
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
              Typography
            </span>
            <div className="flex flex-col gap-1 opacity-90">
              <span
                style={{
                  fontFamily: "var(--font-libre-caslon)",
                  fontStyle: "italic",
                }}
                className="text-lg"
              >
                Libre Caslon (Display)
              </span>
              <span className="text-sm">Inter (Body)</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
              Mood
            </span>
            <MoodWords
              words={["Cinematic", "Painted", "Moody", "Melancholic", "Holy"]}
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black px-6 py-10 text-white sm:px-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="text-xs uppercase tracking-[0.3em] opacity-50"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            FINDGOD / Internal Brand Review
          </p>
          <p className="text-xs opacity-40">
            Which one lands? Tell me what resonates and where.
          </p>
        </div>
      </footer>
    </div>
  );
}
