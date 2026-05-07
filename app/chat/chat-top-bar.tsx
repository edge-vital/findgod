"use client";

/**
 * Thin sticky top bar shown only when there are messages in the
 * conversation. The empty state still uses the giant FINDGOD hero — this
 * bar gives an active chat the structure of an actual app (anchor at top,
 * compass back to a fresh chat).
 */
export function ChatTopBar({ onNewChat }: { onNewChat: () => void }) {
  return (
    <div
      className="fixed inset-x-0 top-0 z-30 border-b border-white/[0.06] bg-[#050507]/80 backdrop-blur-md"
      role="banner"
    >
      <div className="mx-auto flex h-12 w-full max-w-2xl items-center justify-between px-5 sm:px-6">
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

        <button
          type="button"
          onClick={onNewChat}
          className="focus-ring rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-1.5 text-[10px] uppercase tracking-[0.25em] text-white/70 transition-all hover:border-[#C4A87C]/40 hover:bg-white/[0.07] hover:text-white"
          style={{ fontFamily: "var(--font-jetbrains)" }}
          aria-label="Start a new chat"
        >
          New chat
        </button>
      </div>
    </div>
  );
}
