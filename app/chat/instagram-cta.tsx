/**
 * Instagram CTA pill rendered on the homepage empty state. Compact, tonal,
 * no shouting — "follow if you want; the brand isn't begging."
 *
 * The `@findgod` handle is rendered in Archivo Black 900 inline so the
 * brand signature reads even if the user skims the sentence.
 */

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function InstagramCTA() {
  return (
    <div className="mt-6 flex justify-center sm:mt-8">
      <a
        href="https://instagram.com/findgod"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow FINDGOD on Instagram"
        className="focus-ring group inline-flex items-center justify-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm text-white/75 backdrop-blur-sm transition-all hover:-translate-y-px hover:border-[#C4A87C]/40 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_4px_20px_rgba(196,168,124,0.08)]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <InstagramIcon className="h-[14px] w-[14px]" />
        <span className="text-[13px]">
          Follow{" "}
          <span
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 900,
              letterSpacing: "0.01em",
            }}
          >
            @findgod
          </span>{" "}
          on Instagram
        </span>
      </a>
    </div>
  );
}
