"use client";

import { useState, useTransition } from "react";
import { saveVerse } from "@/app/chat/saved-actions";

/**
 * Save-verse inline action. Appears beneath any rendered scripture
 * blockquote whose reference is in the curated 33-verse list.
 *
 * Auth + setup state are handled server-side; this component reads the
 * `SaveResult` and renders one of four states:
 *
 *  - idle    → "Save verse" (default)
 *  - saved   → "Saved" with a softly tinted gold border
 *  - sign-in → "Sign in to save" (clicked while anonymous)
 *  - pending → silent no-op + "Coming soon" pill (migration not applied)
 *
 * No client-side auth check — the server action is the source of truth.
 * That keeps the component pure, avoids spinning a fresh Supabase client
 * during streaming re-renders, and lets the migration-not-applied case
 * fail open without crashing the UI.
 */
export function SaveVerseButton({ verseRef }: { verseRef: string }) {
  const [state, setState] = useState<
    "idle" | "saved" | "sign-in" | "pending" | "error"
  >("idle");
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    if (state === "saved") return;
    startTransition(async () => {
      const result = await saveVerse(verseRef);
      if (result.ok) {
        setState("saved");
        return;
      }
      switch (result.reason) {
        case "anonymous":
          setState("sign-in");
          break;
        case "pending_setup":
          setState("pending");
          break;
        default:
          setState("error");
      }
    });
  };

  const label =
    state === "saved"
      ? "Saved"
      : state === "sign-in"
        ? "Sign in to save"
        : state === "pending"
          ? "Coming soon"
          : state === "error"
            ? "Try again"
            : "Save verse";

  const saved = state === "saved";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending || saved}
      aria-label={saved ? `${verseRef} saved` : `Save ${verseRef} to your account`}
      className={
        "focus-ring inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] transition-colors " +
        (saved
          ? "text-[#C4A87C]"
          : state === "sign-in"
            ? "text-white/55 hover:text-[#C4A87C]"
            : "text-white/55 hover:text-[#C4A87C]") +
        " disabled:cursor-default"
      }
      style={{ fontFamily: "var(--font-jetbrains)" }}
    >
      {saved ? <CheckIcon /> : <BookmarkIcon />}
      {label}
    </button>
  );
}

function BookmarkIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
