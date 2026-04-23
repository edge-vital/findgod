"use client";

import { useEffect, useRef } from "react";
import type { Category } from "./categories";

/**
 * Expands when a category chip is active on the home page. Shows 5
 * pinpointed first-person prompts the user can click to start a chat.
 * Mirrors Claude's prompt-category pattern but tuned for FINDGOD voice —
 * every prompt is a real thing a 16–30 yo lost man would actually say.
 *
 * Keyboard behavior (WCAG wiring):
 *   - `aria-controls="category-panel"` on each chip trigger (set in
 *     ChatInterface) points here via the `id` below.
 *   - On open, focus moves to the first prompt button so tab order
 *     doesn't stall on chrome.
 *   - Escape closes. Focus returns to the trigger chip naturally
 *     because the chip re-renders with active=false; browsers restore
 *     focus to the most-recently-focused element in its ancestors.
 */
export function CategoryPanel({
  category,
  disabled,
  onClose,
  onPick,
}: {
  category: Category;
  disabled: boolean;
  onClose: () => void;
  onPick: (text: string) => void;
}) {
  const firstPromptRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    firstPromptRef.current?.focus();
  }, [category.label]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>): void {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  return (
    <div
      id="category-panel"
      className="animate-fade-up mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md"
      style={{ animationDelay: "0ms" }}
      role="region"
      aria-label={`${category.label} prompts`}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
        <p
          className="text-[10px] uppercase tracking-[0.35em] text-white/55"
          style={{
            fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
          }}
        >
          {category.label}
        </p>
        <button
          onClick={onClose}
          aria-label="Close category"
          className="focus-ring rounded-full text-sm text-white/55 transition-colors hover:text-white"
        >
          <span aria-hidden>✕</span>
        </button>
      </div>
      <ul className="divide-y divide-white/5">
        {category.prompts.map((p, idx) => (
          <li key={p}>
            <button
              ref={idx === 0 ? firstPromptRef : undefined}
              onClick={() => onPick(p)}
              disabled={disabled}
              className="focus-ring group/prompt flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] leading-snug text-white/85 transition-colors hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              <span>{p}</span>
              <span
                aria-hidden
                className="flex-none text-white/50 transition-colors group-hover/prompt:text-[#C4A87C]/80"
              >
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
