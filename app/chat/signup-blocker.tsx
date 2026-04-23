import { SignupForm } from "../signup-form";

/**
 * The blocker shown when an anonymous visitor hits their free-chat limit.
 *
 * Thin wrapper: the real content (three distinct views — initial / code /
 * success) lives inside `SignupForm` so chrome can be right-sized per
 * step without this component knowing which step is active.
 *
 * Adds a warm gold-tinted aura behind the card to pull the eye in and
 * signal "this is the moment." The aura sits behind the card via a
 * blurred absolutely-placed sibling, so it stays decorative and doesn't
 * clip the card's corners.
 */
export function SignupBlocker() {
  return (
    <div className="relative">
      {/* Warm gold aura — cinematic depth behind the card. Subtle; the
          card is still the hero. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-16 -z-10 rounded-[60px] bg-[radial-gradient(ellipse_at_center,rgba(196,168,124,0.11)_0%,rgba(196,168,124,0.04)_35%,transparent_70%)] blur-3xl"
      />

      {/* Card */}
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.045] to-white/[0.02] px-6 py-10 text-center backdrop-blur-md sm:px-10 sm:py-12"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {/* Top edge highlight — hairline of warm light, like a candle
            glowing just above the card */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C4A87C]/50 to-transparent"
        />

        <SignupForm />
      </div>
    </div>
  );
}
