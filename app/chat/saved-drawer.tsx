"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  listSavedVerses,
  unsaveVerse,
  type SavedVerse,
} from "./saved-actions";

/**
 * Saved-verses drawer. Mirrors HistoryDrawer in structure and styling
 * so the two side-by-side icons feel like siblings.
 *
 * Until the `saved_verses` migration is applied, `listSavedVerses` will
 * return [] (fail-open) and the drawer renders the empty state. Once
 * applied, items appear automatically — no further code changes needed.
 */
export function SavedDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [items, setItems] = useState<SavedVerse[] | null>(null);
  const [, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setItems(null);
    listSavedVerses().then((list) => {
      if (!cancelled) setItems(list);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      const id = requestAnimationFrame(() => panelRef.current?.focus());
      return () => cancelAnimationFrame(id);
    } else {
      previouslyFocused.current?.focus?.();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleUnsave = (ref: string) => {
    // Optimistic remove — the unsave action is idempotent server-side.
    setItems((prev) => (prev ? prev.filter((v) => v.ref !== ref) : prev));
    startTransition(async () => {
      await unsaveVerse(ref);
    });
  };

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close saved verses"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Saved verses"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/[0.08] bg-[#050507] shadow-[0_0_60px_rgba(0,0,0,0.6)] focus:outline-none"
      >
        <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h2
            className="text-[11px] uppercase tracking-[0.3em] text-white/70"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            Saved verses
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/70 transition-colors hover:border-[#C4A87C]/40 hover:text-white"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            Close
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items === null && (
            <p
              className="text-center text-[11px] uppercase tracking-[0.25em] text-white/40"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Loading…
            </p>
          )}

          {items !== null && items.length === 0 && (
            <p
              className="mt-12 text-center text-sm text-white/55"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Verses you save will appear here.
            </p>
          )}

          {items !== null && items.length > 0 && (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={item.ref}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4"
                >
                  <blockquote
                    className="border-l-2 border-[#C4A87C]/60 pl-3 text-[15px] italic leading-[1.55] text-white/85"
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                    }}
                  >
                    {item.text}
                  </blockquote>
                  <div className="mt-3 flex items-center justify-between">
                    <p
                      className="text-[10px] uppercase tracking-[0.3em] text-[#C4A87C]/80"
                      style={{ fontFamily: "var(--font-jetbrains)" }}
                    >
                      {item.ref}
                    </p>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/verse-image?ref=${encodeURIComponent(item.ref)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-ring rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-white/55 hover:text-[#C4A87C]"
                        style={{ fontFamily: "var(--font-jetbrains)" }}
                        aria-label={`View ${item.ref} as image`}
                      >
                        Image
                      </a>
                      <button
                        type="button"
                        onClick={() => handleUnsave(item.ref)}
                        className="focus-ring rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-white/45 hover:text-white/80"
                        style={{ fontFamily: "var(--font-jetbrains)" }}
                        aria-label={`Remove ${item.ref}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
