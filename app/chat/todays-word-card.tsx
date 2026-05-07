"use client";

import type { DailyVerse } from "@/lib/todays-verse";

/**
 * The dated daily-verse card on the empty state. Sits between the
 * rotating greeting and the input. One verse per UTC day, hand-picked
 * to fit the FINDGOD voice. See `lib/todays-verse.ts` for the rotation.
 */
export function TodaysWordCard({
  verse,
  dateLabel,
}: {
  verse: DailyVerse;
  dateLabel: string;
}) {
  return (
    <div
      className="animate-fade-up w-full max-w-md rounded-2xl border border-[#C4A87C]/20 bg-white/[0.025] px-6 py-5 text-center shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
      style={{ animationDelay: "375ms" }}
    >
      <p
        className="text-[10px] uppercase tracking-[0.35em] text-[#C4A87C]/85"
        style={{ fontFamily: "var(--font-jetbrains)" }}
      >
        Today&rsquo;s Word · {dateLabel}
      </p>

      <p
        className="mt-4 text-base leading-[1.55] text-white/90 sm:text-lg"
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontStyle: "italic",
        }}
      >
        &ldquo;{verse.text}&rdquo;
      </p>

      <p
        className="mt-4 text-[10px] uppercase tracking-[0.3em] text-white/55"
        style={{ fontFamily: "var(--font-jetbrains)" }}
      >
        — {verse.ref} (ESV)
      </p>
    </div>
  );
}
