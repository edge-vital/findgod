import { ChatInterface } from "./chat-interface";
import { CursorSpotlight } from "./cursor-spotlight";
import { LandedTracker } from "./landed-tracker";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#050507]">
      {/* Subtle radial lift for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,30,35,0.5)_0%,rgba(5,5,7,1)_70%)]"
      />

      {/* Fine dot grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:32px_32px]"
      />

      {/* Cursor-following warm spotlight (desktop only). Adds ambient depth. */}
      <CursorSpotlight />

      {/* Fires a one-time `landed` funnel event on first session visit. Invisible. */}
      <LandedTracker />

      {/* Cinematic vignette — radial darkening at the edges pulls the eye to center.
          A24 / film poster technique. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[3] bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]"
      />

      {/* Film grain overlay — inline SVG fractal noise. Very subtle (4% opacity).
          Gives the page that 'real, shot on film' texture without an image asset. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[4] opacity-[0.045] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />

      {/* Chat — the actual product (no top nav; FINDGOD lives in the hero).
          Vertically centered on all sizes so the search bar sits at the visual focal point. */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-8 sm:px-6 sm:py-16">
        <div className="w-full max-w-2xl">
          <ChatInterface />
        </div>
      </section>

      {/* Minimal footer — single legal line, centered */}
      <footer className="relative z-10 px-6 py-6 sm:px-10">
        <div className="mx-auto flex max-w-4xl items-center justify-center">
          <p
            className="text-[11px] uppercase tracking-[0.25em] text-white/25"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            © 2026 FINDGOD LLC
          </p>
        </div>
      </footer>
    </main>
  );
}

