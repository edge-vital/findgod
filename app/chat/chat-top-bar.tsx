"use client";

/**
 * Thin sticky top bar shown only when there are messages in the
 * conversation. The empty state still uses the giant FINDGOD hero — this
 * bar gives an active chat the structure of an actual app (anchor at top,
 * compass back to a fresh chat).
 */
export function ChatTopBar({
  onNewChat,
  onOpenHistory,
  onOpenSaved,
  showHistory,
  streakDays,
}: {
  onNewChat: () => void;
  onOpenHistory?: () => void;
  onOpenSaved?: () => void;
  showHistory?: boolean;
  /**
   * Optional streak count — distinct UTC days the user has chatted.
   * Rendered as a soft chip only when ≥ 3 (under that, it doesn't
   * carry meaning yet — surfacing "1 day into the path" reads forced).
   */
  streakDays?: number;
}) {
  return (
    <div
      className="fixed inset-x-0 top-0 z-30 border-b border-white/[0.06] bg-[#050507]/80 backdrop-blur-md"
      role="banner"
    >
      <div className="mx-auto flex h-12 w-full max-w-2xl items-center justify-between px-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span
            className="uppercase leading-none tracking-[-0.02em] text-white"
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 900,
              fontSize: "16px",
            }}
          >
            FINDGOD
          </span>

          {/* Gentle streak chip — no shame, no red, no notifications.
              Hidden under 3 days; reads forced otherwise. */}
          {typeof streakDays === "number" && streakDays >= 3 && (
            <span
              className="hidden items-center gap-1.5 rounded-full border border-[#C4A87C]/25 bg-[#C4A87C]/[0.04] px-2.5 py-1 text-[9px] uppercase tracking-[0.25em] text-[#C4A87C]/85 sm:inline-flex"
              style={{ fontFamily: "var(--font-jetbrains)" }}
              aria-label={`${streakDays} days into the path`}
            >
              {streakDays} days into the path
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showHistory && onOpenSaved && (
            <button
              type="button"
              onClick={onOpenSaved}
              className="focus-ring flex min-h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-white/70 transition-all hover:border-[#C4A87C]/40 hover:bg-white/[0.07] hover:text-white"
              style={{ fontFamily: "var(--font-jetbrains)" }}
              aria-label="Open saved verses"
            >
              <SavedIcon />
              <span className="hidden sm:inline">Saved</span>
            </button>
          )}

          {showHistory && onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="focus-ring flex min-h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-white/70 transition-all hover:border-[#C4A87C]/40 hover:bg-white/[0.07] hover:text-white"
              style={{ fontFamily: "var(--font-jetbrains)" }}
              aria-label="Open conversation history"
            >
              <HistoryIcon />
              <span className="hidden sm:inline">History</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNewChat}
            className="focus-ring min-h-9 rounded-lg border border-white/15 bg-white/[0.03] px-3.5 py-2 text-[10px] uppercase tracking-[0.25em] text-white/70 transition-all hover:border-[#C4A87C]/40 hover:bg-white/[0.07] hover:text-white"
            style={{ fontFamily: "var(--font-jetbrains)" }}
            aria-label="Start a new chat"
          >
            New chat
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.74 9.74 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

function SavedIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
