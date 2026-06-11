"use client";

import { useEffect, useRef, useState } from "react";
import { InscriptionDivider } from "@/components/inscription-divider";
import {
  listConversations,
  loadConversation,
  type ConversationSummary,
  type LoadedMessage,
} from "./history-actions";

/**
 * Slide-in conversation history panel for authenticated users.
 * Mobile: full-width bottom sheet rising from the side.
 * Desktop: right-anchored drawer.
 *
 * Lists the user's last ~50 conversations. Clicking one calls
 * `onLoadConversation` with the full message thread so the parent can
 * swap the active chat without a navigation.
 *
 * Fail-open: server errors return empty lists — the drawer renders an
 * "empty path" message instead of crashing.
 */
export function HistoryDrawer({
  open,
  onClose,
  onLoadConversation,
}: {
  open: boolean;
  onClose: () => void;
  onLoadConversation: (messages: LoadedMessage[]) => void;
}) {
  const [items, setItems] = useState<ConversationSummary[] | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Fetch on open. Re-fetch each open so newly-started conversations
  // surface without a page reload.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setItems(null);
    listConversations().then((list) => {
      if (!cancelled) setItems(list);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Focus management — store opener focus, move to drawer on open,
  // restore on close. Keeps keyboard users oriented.
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      // Wait a tick for the panel to mount
      const id = requestAnimationFrame(() => {
        panelRef.current?.focus();
      });
      return () => cancelAnimationFrame(id);
    } else {
      previouslyFocused.current?.focus?.();
    }
  }, [open]);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handlePick = async (conversationId: string) => {
    setLoadingId(conversationId);
    try {
      const msgs = await loadConversation(conversationId);
      if (msgs.length > 0) {
        onLoadConversation(msgs);
        onClose();
      }
    } finally {
      setLoadingId(null);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Scrim — closes on click */}
      <button
        type="button"
        aria-label="Close history"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Conversation history"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/[0.08] bg-[#050507] shadow-[0_0_60px_rgba(0,0,0,0.6)] focus:outline-none"
      >
        <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h2
            className="text-[11px] uppercase tracking-[0.3em] text-white/70"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            The path so far
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring min-h-9 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-white/70 transition-colors hover:border-[#C4A87C]/40 hover:text-white"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            Close
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items === null && (
            // Brand loading state — the inscription breathes while we fetch,
            // same as the AI thinking indicator. No raw "Loading…" text.
            <InscriptionDivider className="my-10 animate-pulse" />
          )}

          {items !== null && items.length === 0 && (
            <p
              className="mt-12 text-center text-sm text-white/55"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              No prior conversations yet. Every step counts.
            </p>
          )}

          {items !== null && items.length > 0 && (
            <ul className="flex flex-col gap-2">
              {items.map((item) => {
                const loading = loadingId === item.conversationId;
                return (
                  <li key={item.conversationId}>
                    <button
                      type="button"
                      onClick={() => handlePick(item.conversationId)}
                      disabled={loading}
                      className="focus-ring group w-full rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-left transition-all hover:border-[#C4A87C]/30 hover:bg-white/[0.05] disabled:cursor-wait disabled:opacity-60"
                    >
                      <p
                        className="line-clamp-2 text-sm text-white/85 transition-colors group-hover:text-white"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {item.firstQuestion}
                      </p>
                      <p
                        className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/40"
                        style={{ fontFamily: "var(--font-jetbrains)" }}
                      >
                        <span>{formatRelative(item.lastActivityIso)}</span>
                        <span aria-hidden className="text-white/20">
                          ·
                        </span>
                        <span>
                          {item.turnCount} {item.turnCount === 1 ? "turn" : "turns"}
                        </span>
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}

/**
 * Compact "2h ago / 3d ago / Mar 4" relative time. Pure client formatting.
 */
function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.max(0, (Date.now() - then) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86_400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86_400 * 7) return `${Math.floor(diffSec / 86_400)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
