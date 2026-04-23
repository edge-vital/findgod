/**
 * `CM03` F-Cross — the brand's compact mark. A single bold F where the
 * horizontal arm extends past both sides of the vertical spine, forming
 * a Christian cross. The F vertical + extended top arm = a cross. The
 * F's middle arm is what identifies it as an F. The G is implied by
 * FINDGOD context.
 *
 * Locked spec per `.claude/rules/brand-identity.md`. Do not change the
 * viewBox, rect coordinates, or dimensions without updating that file.
 *
 * Used for:
 *   - Hat embroidery (chest patch when full wordmark won't fit)
 *   - App icon (future FINDGOD app)
 *   - Business cards (small mark in corner)
 *   - Sticker / packaging tape (continuous repeat pattern)
 *   - Tight nav contexts (mobile app bars, browser bookmark icon)
 *   - Anywhere the brand's INITIAL needs to appear small but a circle
 *     seal would feel ceremonial
 *
 * NEVER combine with the 888 seal in the same composition — they serve
 * different jobs (signature vs initial) and are mutually exclusive.
 */
export function FCross({ size = 130 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 100 130"
      width={size * 0.85}
      height={size}
      fill="currentColor"
      aria-label="FINDGOD F-cross"
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
