"use client";

import { useEffect, useState } from "react";
import {
  getTodaysVerse,
  getTodaysDateLabel,
  type DailyVerse,
} from "@/lib/todays-verse";

/**
 * The dated daily-verse card on the empty state. Sits below the input +
 * category chips as the closing anchor of the page. One verse per UTC day,
 * hand-picked to fit the FINDGOD voice. See `lib/todays-verse.ts`.
 */
export function TodaysWordCard({
  verse,
  dateLabel,
}: {
  verse: DailyVerse;
  dateLabel: string;
}) {
  // The home page is statically prerendered, so the server-passed verse and
  // date are frozen at build time and drift stale between deploys. Recompute
  // on the client after hydration (not during render, to avoid a hydration
  // mismatch) so "Today's Word" always means today.
  const [live, setLive] = useState<{
    verse: DailyVerse;
    dateLabel: string;
  } | null>(null);
  useEffect(() => {
    setLive({ verse: getTodaysVerse(), dateLabel: getTodaysDateLabel() });
  }, []);
  const shown = live ?? { verse, dateLabel };

  return (
    <div
      className="animate-fade-up w-full max-w-md rounded-2xl border border-[#C4A87C]/20 bg-white/[0.025] px-6 py-5 text-center shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
      style={{ animationDelay: "1050ms" }}
    >
      <p
        className="text-[10px] uppercase tracking-[0.35em] text-[#C4A87C]/85"
        style={{ fontFamily: "var(--font-jetbrains)" }}
      >
        Today&rsquo;s Word · {shown.dateLabel}
      </p>

      <p
        className="mt-4 text-base leading-[1.55] text-white/90 sm:text-lg"
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontStyle: "italic",
        }}
      >
        &ldquo;{shown.verse.text}&rdquo;
      </p>

      <p
        className="mt-4 text-[10px] uppercase tracking-[0.3em] text-white/55"
        style={{ fontFamily: "var(--font-jetbrains)" }}
      >
        — {shown.verse.ref} (ESV)
      </p>
    </div>
  );
}
