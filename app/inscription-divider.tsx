/**
 * `ΙΗΣΟΥΣ ≡ 888` divider — the brand's section-break motif.
 *
 * The Greek inscription is the isopsephy (gematria) of Jesus: the letters
 * ΙΗΣΟΥΣ sum to 888. Cited in the Sibylline Oracles (Book 1) and by
 * Irenaeus in Against Heresies (c. 180 AD). Rewards the curious; invisible
 * to people who don't know.
 *
 * Used anywhere a plain `<hr>` would otherwise appear — below the hero
 * wordmark, between AI response sections, on the signup wall, etc.
 *
 * Locked per brand-identity.md.
 */
export function InscriptionDivider({
  className = "my-6",
}: {
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${className}`}
      title="ΙΗΣΟΥΣ ≡ 888 — the isopsephy of Jesus (Irenaeus, c. 180 AD)"
    >
      <span className="h-px w-10 bg-white/15" />
      <span
        className="text-[10px] uppercase tracking-[0.4em] text-white/55"
        style={{ fontFamily: "var(--font-jetbrains), ui-monospace, monospace" }}
      >
        ΙΗΣΟΥΣ ≡ 888
      </span>
      <span className="h-px w-10 bg-white/15" />
    </div>
  );
}
