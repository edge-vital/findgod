"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { InscriptionDivider } from "@/components/inscription-divider";
import { createClient as createBrowserSupabase } from "@/lib/supabase/client";
import { CATEGORIES } from "./chat/categories";
import { CategoryPanel } from "./chat/category-panel";
import { ReturningGreeting, LiveMessage } from "./chat/greetings";
import { InstagramCTA } from "./chat/instagram-cta";
import { MessageBubble, ThinkingIndicator } from "./chat/message-bubble";
import { SignupBlocker } from "./chat/signup-blocker";

/**
 * The landing-page chat shell — orchestrates empty state, message list,
 * input bar, category chips, and the signup wall. The actual pieces live
 * in `./chat/`:
 *
 *   categories.ts        — the 5 chips + their 25 first-person prompts
 *   category-panel.tsx   — the expanded chip panel with keyboard wiring
 *   multiple-choice.tsx  — ```choices block parsing + button panel
 *   message-bubble.tsx   — user + AI bubbles + ThinkingIndicator
 *   greetings.tsx        — time-of-day LiveMessage + ReturningGreeting
 *   instagram-cta.tsx    — follow @findgod pill
 *   signup-blocker.tsx   — free-limit wall wrapping SignupForm
 *
 * This file owns chat state (useChat, input, limit, auth) + the layout.
 */

/**
 * Fallback limit used before the first server response writes the real
 * per-visitor limit (random 3–5) into the `findgod_chat_meta` cookie.
 * The server is authoritative — this is just so the UI has a sane value
 * on first paint.
 */
const DEFAULT_FREE_LIMIT = 5;

const META_COOKIE_NAME = "findgod_chat_meta";

/**
 * Read the visitor's assigned chat limit from the non-HttpOnly meta cookie.
 * The cookie value is `count:limit`. Returns the limit portion (3–5) or the
 * fallback if the cookie is absent or malformed. Client-side only.
 */
function readLimitFromMetaCookie(): number {
  if (typeof document === "undefined") return DEFAULT_FREE_LIMIT;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${META_COOKIE_NAME}=`));
  if (!match) return DEFAULT_FREE_LIMIT;
  try {
    const raw = decodeURIComponent(match.slice(META_COOKIE_NAME.length + 1));
    const parts = raw.split(":");
    const limit = parseInt(parts[1] ?? "", 10);
    if (Number.isFinite(limit) && limit >= 3 && limit <= 5) return limit;
  } catch {
    // fall through to default
  }
  return DEFAULT_FREE_LIMIT;
}

/**
 * Rotating input placeholder prompts. Cycles every 3 seconds while the
 * input is empty and there's no chat yet. Designed to suggest the range
 * of things a man might bring here — from heavy struggle to gratitude
 * to honest doubt.
 */
const ROTATING_PROMPTS = [
  "What's weighing on you?",
  "What are you going through?",
  "What are you grateful for?",
  "What are you questioning?",
  "What's pulling at you?",
  "What are you afraid of?",
  "What are you tired of?",
  "What's the prayer you can't say out loud?",
  "What are you angry about?",
  "What's heavy on your chest?",
];

export function ChatInterface() {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const [input, setInput] = useState("");
  const [limitReachedOnLoad, setLimitReachedOnLoad] = useState(false);
  const [promptIdx, setPromptIdx] = useState(0);
  const [freeLimit, setFreeLimit] = useState<number>(DEFAULT_FREE_LIMIT);
  const [activeCategoryIdx, setActiveCategoryIdx] = useState<number | null>(
    null,
  );
  // null = unauthenticated (or still loading). Once set to a string, user is
  // signed in and the free-message wall is bypassed.
  const [authFirstName, setAuthFirstName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevStatusRef = useRef<string>(status);

  // Remember if the user has already used their free chat in a previous visit.
  // Not a hard wall (private browsing bypasses) but good enough for MVP.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const used = localStorage.getItem("findgod_free_chat_used");
      if (used === "true") {
        setLimitReachedOnLoad(true);
      }
    }
  }, []);

  // Subscribe to Supabase auth. Logged-in users bypass the anonymous chat
  // limit entirely, and the AI addresses them by name via the system prompt.
  useEffect(() => {
    const supabase = createBrowserSupabase();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthFirstName(
        (user?.user_metadata?.first_name as string | undefined) ?? null,
      );
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthFirstName(
        (session?.user?.user_metadata?.first_name as string | undefined) ??
          null,
      );
    });
    return () => subscription.unsubscribe();
  }, []);

  // Sync dynamic limit from the `findgod_chat_meta` cookie. The server
  // writes the visitor's assigned limit (random 3–5) on every chat response;
  // we re-read it after each exchange so UI matches server-side state.
  useEffect(() => {
    setFreeLimit(readLimitFromMetaCookie());
  }, [messages.length]);

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const limitReachedThisSession = userMessageCount >= freeLimit;
  const authenticated = authFirstName !== null;
  // Authenticated users have an email + verified identity — they chat freely.
  const limitReached =
    !authenticated && (limitReachedThisSession || limitReachedOnLoad);

  // Persist limit to localStorage for future visits.
  useEffect(() => {
    if (limitReachedThisSession && typeof window !== "undefined") {
      localStorage.setItem("findgod_free_chat_used", "true");
    }
  }, [limitReachedThisSession]);

  // ── Scroll behavior ────────────────────────────────────────────────
  // 1. When user submits a new message → smooth scroll to bottom once.
  // 2. During streaming → instant scroll to keep the latest in view,
  //    no animation (prevents fighting-animations jank).
  // 3. Idle → no auto-scrolling (user is free to scroll up to re-read).

  useEffect(() => {
    if (prevStatusRef.current === "ready" && status === "submitted") {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
    prevStatusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (status === "streaming") {
      messagesEndRef.current?.scrollIntoView({ block: "end" });
    }
  }, [messages, status]);

  // Rotate the input placeholder every 3s while idle on the empty state.
  // Pause rotation once the user starts typing or starts a chat.
  const isTyping = input.length > 0;
  const hasChat = messages.length > 0;
  useEffect(() => {
    if (isTyping || hasChat || limitReached) return;
    const id = setInterval(() => {
      setPromptIdx((i) => (i + 1) % ROTATING_PROMPTS.length);
    }, 3000);
    return () => clearInterval(id);
  }, [isTyping, hasChat, limitReached]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || limitReached || status !== "ready") return;
    sendMessage({ text: trimmed });
    setInput("");
  };

  const handleSamplePrompt = (prompt: string) => {
    if (limitReached || status !== "ready") return;
    sendMessage({ text: prompt });
    setActiveCategoryIdx(null);
  };

  const handleChoice = (text: string) => {
    if (limitReached || status !== "ready") return;
    sendMessage({ text });
  };

  const handleSomethingElse = () => {
    inputRef.current?.focus();
  };

  const choiceDisabled = limitReached || status !== "ready";

  const hasMessages = messages.length > 0;

  return (
    <div className="flex w-full flex-col gap-6 sm:gap-8">
      {/* ===== EMPTY STATE ===== */}
      {!hasMessages && !limitReached && (
        <div className="flex flex-col items-center gap-5 py-6 text-center sm:gap-6 sm:py-12">
          <h1
            className="animate-fade-up uppercase leading-[0.9] tracking-[-0.03em] text-white"
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 900,
              fontSize: "clamp(56px, 10vw, 120px)",
              animationDelay: "0ms",
            }}
          >
            FINDGOD
          </h1>

          {/* The 888 inscription — sits under the wordmark like a coat-of-arms motto */}
          <div
            className="animate-fade-up animate-breathe"
            style={{ animationDelay: "150ms, 900ms" }}
          >
            <InscriptionDivider className="mt-1" />
          </div>

          {/* Greeting for returning authenticated visitors; rotating live
              encouragement for everyone else. */}
          <div
            className="animate-fade-up"
            style={{ animationDelay: "300ms" }}
          >
            {authenticated && authFirstName ? (
              <ReturningGreeting firstName={authFirstName} />
            ) : (
              <LiveMessage />
            )}
          </div>
        </div>
      )}

      {/* ===== MESSAGE LIST =====
          `role="log"` + `aria-live="polite"` announces AI responses to
          screen readers as they stream in. `aria-relevant="additions"`
          keeps the announcement scoped to new bubbles. */}
      {hasMessages && (
        <div
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Chat transcript"
          className="flex flex-col gap-6 py-8"
        >
          {messages.map((m: UIMessage) => (
            <MessageBubble
              key={m.id}
              message={m}
              disabled={choiceDisabled}
              onSelectChoice={handleChoice}
              onSomethingElse={handleSomethingElse}
              isStreaming={
                status === "streaming" &&
                m.role === "assistant" &&
                m.id === messages[messages.length - 1]?.id
              }
            />
          ))}
          {status === "submitted" && <ThinkingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* ===== INPUT or BLOCKER ===== */}
      {limitReached ? (
        <SignupBlocker />
      ) : (
        <div className="flex flex-col gap-4">
          {/* SEARCH BAR — the visual hero of the page.
              Wrapped with an ambient glow that intensifies on focus. */}
          <div
            className="group/input animate-fade-up relative w-full"
            style={{ animationDelay: "450ms" }}
          >
            {/* Soft ambient glow behind the input — intensifies on focus */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-4 -inset-y-4 rounded-[40px] bg-gradient-to-b from-white/[0.04] to-white/[0.01] opacity-0 blur-2xl transition-opacity duration-700 group-focus-within/input:opacity-100"
            />
            {/* Subtle gold-tinted ring on focus */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-px rounded-full bg-gradient-to-r from-[#C4A87C]/0 via-white/15 to-[#C4A87C]/0 opacity-0 blur-[2px] transition-opacity duration-500 group-focus-within/input:opacity-60"
            />
            <form
              onSubmit={handleSubmit}
              className="relative w-full"
              autoComplete="off"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.currentTarget.value)}
                disabled={status !== "ready"}
                placeholder=""
                aria-label="Your message"
                className="relative w-full rounded-full border border-white/22 bg-white/[0.06] py-5 pl-7 pr-16 text-base text-white caret-[#C4A87C] shadow-[0_10px_36px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-md transition-all focus:border-[#C4A87C]/45 focus:bg-white/[0.09] focus:shadow-[0_10px_44px_rgba(0,0,0,0.55),0_0_70px_rgba(196,168,124,0.14),0_0_0_1px_rgba(255,255,255,0.08)_inset] focus:outline-none disabled:opacity-50"
                style={{ fontFamily: "var(--font-inter)" }}
                autoFocus
              />

              {/* Custom animated placeholder overlay — blurs in on each rotation */}
              {!input && (
                <span
                  key={hasMessages ? "subsequent" : ROTATING_PROMPTS[promptIdx]}
                  className="animate-prompt-blur-in pointer-events-none absolute inset-y-0 left-7 right-16 flex items-center text-base text-white/50"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {hasMessages
                    ? "Your reply…"
                    : ROTATING_PROMPTS[promptIdx]}
                </span>
              )}

              <button
                type="submit"
                disabled={!input.trim() || status !== "ready"}
                aria-label="Send message"
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.15)] transition-all hover:scale-105 hover:bg-white hover:shadow-[0_4px_30px_rgba(255,255,255,0.25)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none disabled:hover:scale-100"
              >
                <SendArrowIcon />
              </button>
            </form>
          </div>

          {!hasMessages && (
            <>
              {/* Category chips — click to expand a panel of pinpointed prompts */}
              <div
                className="animate-fade-up mt-6 flex flex-col items-center gap-3 sm:mt-8 sm:gap-4"
                style={{ animationDelay: "600ms" }}
              >
                <p
                  className="text-[10px] uppercase tracking-[0.35em] text-white/60"
                  style={{
                    fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
                  }}
                >
                  Where are you at?
                </p>
                <div className="flex flex-wrap justify-center gap-2.5">
                  {CATEGORIES.map((cat, idx) => {
                    const active = activeCategoryIdx === idx;
                    return (
                      <button
                        key={cat.label}
                        onClick={() =>
                          setActiveCategoryIdx(active ? null : idx)
                        }
                        disabled={status !== "ready"}
                        aria-expanded={active}
                        aria-controls="category-panel"
                        aria-haspopup="menu"
                        aria-label={`${cat.label} — ${cat.prompts.length} prompts`}
                        className={`focus-ring rounded-full border px-5 py-2 text-xs uppercase tracking-[0.2em] transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                          active
                            ? "-translate-y-px border-[#C4A87C]/60 bg-white/[0.08] text-white shadow-[0_4px_24px_rgba(196,168,124,0.15)]"
                            : "border-white/10 bg-white/[0.02] text-white/65 hover:-translate-y-px hover:border-[#C4A87C]/50 hover:bg-white/[0.07] hover:text-white hover:shadow-[0_4px_20px_rgba(196,168,124,0.08)]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeCategoryIdx !== null && (
                <CategoryPanel
                  category={CATEGORIES[activeCategoryIdx]}
                  disabled={status !== "ready" || limitReached}
                  onClose={() => setActiveCategoryIdx(null)}
                  onPick={handleSamplePrompt}
                />
              )}

              <div
                className="animate-fade-up"
                style={{ animationDelay: "750ms" }}
              >
                <InstagramCTA />
              </div>
            </>
          )}

          {error && (
            <p role="alert" className="text-xs text-red-400">
              That didn&rsquo;t land. Try again.
            </p>
          )}

          {/* Brand promise pillars — stacked on mobile, single line on desktop */}
          <div
            className="animate-fade-up mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[10px] uppercase tracking-[0.25em] text-white/60"
            style={{
              fontFamily: "var(--font-inter)",
              animationDelay: "900ms",
            }}
          >
            <span>Scripture-anchored</span>
            <span aria-hidden className="text-white/20">·</span>
            <span>Unapologetically direct</span>
            <span aria-hidden className="text-white/20">·</span>
            <span>Always here</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Thin send-arrow SVG inside the chat input's submit button. Kept inline
 * because it's only rendered once in this file.
 */
function SendArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}
