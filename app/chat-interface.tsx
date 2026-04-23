"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { InscriptionDivider } from "./inscription-divider";
import { SignupForm } from "./signup-form";
import { createClient as createBrowserSupabase } from "@/lib/supabase/client";

/**
 * `MarkdownMessage` is dynamically imported so the react-markdown +
 * remark-gfm + unified/mdast/micromark dep graph (~100KB gzipped) only
 * hits the client when an AI message actually renders — not on initial
 * page load, when most visitors haven't even clicked Send yet.
 */
const MarkdownMessage = dynamic(() => import("./markdown-message"), {
  ssr: false,
  loading: () => null,
});

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
 * Home-page category groups. Each chip expands to 5 pinpointed prompts the
 * 16–30 yo lost man is actually asking right now. Categories are active
 * verbs that match the real doors young men walk through on the way back
 * to Christ:
 *
 *   WRESTLE  — doubt, intellectual questions, "is any of this real?"
 *   OVERCOME — porn, phone, drinking, shame, anxiety (vices)
 *   BECOME   — purpose, manhood, discipline, calling
 *   HEAL     — father wounds, regret, failure, loneliness
 *   BEGIN    — where to start reading, praying, following Jesus
 *
 * Prompts are first-person, vulnerable, specific — not generic "help me
 * with X" openers. They teach the shared conversation style on the way in.
 */
type Category = {
  label: string;
  prompts: string[];
};

const CATEGORIES: Category[] = [
  {
    label: "Wrestle",
    prompts: [
      "Why would a good God allow suffering?",
      "I can't tell if God is real or if I just want Him to be",
      "How do I know the Bible is actually true?",
      "What if I don't feel anything when I pray?",
      "Is it too late for me to come back?",
    ],
  },
  {
    label: "Overcome",
    prompts: [
      "I can't stop watching porn",
      "My phone is controlling me",
      "I'm drinking more than I should",
      "I'm stuck in a shame spiral",
      "Anxiety won't let me rest",
    ],
  },
  {
    label: "Become",
    prompts: [
      "What is a man actually for?",
      "How do I find my purpose?",
      "How do I build real discipline?",
      "I'm wasting my twenties and I know it",
      "What does strength look like in God's eyes?",
    ],
  },
  {
    label: "Heal",
    prompts: [
      "My father wasn't there",
      "I can't forgive myself",
      "I've hurt people I love",
      "I failed at something big",
      "I'm lonely even around people",
    ],
  },
  {
    label: "Begin",
    prompts: [
      "Where do I start reading the Bible?",
      "How do I actually pray?",
      "Who is Jesus, really?",
      "I want to come back to faith",
      "What's the gospel in one sentence?",
    ],
  },
];

/**
 * Rotating input placeholder prompts. Cycles every 3 seconds while the input is
 * empty and there's no chat yet. Designed to suggest the range of things a man
 * might bring here — from heavy struggle to gratitude to honest doubt.
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
          keeps the announcement scoped to new bubbles (not re-reads of
          the whole list). Streaming assistant bubbles carry `aria-busy`
          while in progress so AT waits for the final text. */}
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

/* ================= SEND ARROW ICON ================= */

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

/* ================= CHOICES PARSING ================= */

type Choices = { question: string; options: string[] };

/**
 * Pull a ```choices fenced block out of an AI message. The system prompt
 * instructs Claude to end meaningful responses with exactly one such block
 * containing `{question, options}` JSON.
 *
 * During streaming the closing ``` doesn't exist yet, which previously
 * leaked the raw opener (```choices\n{"question":"...) into the UI as a
 * visible code block. We now hide everything from the opening fence
 * onward as soon as it appears — once the block closes we parse it into
 * real clickable choices.
 */
function parseChoices(text: string): {
  cleanText: string;
  choices: Choices | null;
} {
  const closed = text.match(/```choices\s*\n([\s\S]*?)\n```/);
  if (closed) {
    try {
      const parsed = JSON.parse(closed[1]);
      if (
        typeof parsed?.question === "string" &&
        Array.isArray(parsed?.options)
      ) {
        const options = (parsed.options as unknown[])
          .filter((o): o is string => typeof o === "string" && o.length > 0)
          .slice(0, 6);
        if (options.length >= 2) {
          return {
            cleanText: text.replace(closed[0], "").trim(),
            choices: { question: parsed.question, options },
          };
        }
      }
    } catch {
      // malformed JSON — fall through and strip the opener anyway so the
      // raw block never shows up in the rendered response.
    }
  }

  // Mid-stream: opener exists but the closing fence hasn't arrived yet
  // (or the JSON is malformed). Strip everything from the opener forward
  // so the user never sees the raw payload.
  const openerIdx = text.indexOf("```choices");
  if (openerIdx !== -1) {
    return { cleanText: text.slice(0, openerIdx).trimEnd(), choices: null };
  }

  return { cleanText: text, choices: null };
}

/* ================= MULTIPLE CHOICE ================= */

/**
 * Renders the pinpointed cliffhanger question + pre-written answer options
 * from a ```choices block. Clicking an option sends it as the next user
 * message. "Something else" focuses the free-text input instead.
 */
function MultipleChoice({
  question,
  options,
  disabled,
  onSelect,
  onSomethingElse,
}: Choices & {
  disabled: boolean;
  onSelect: (text: string) => void;
  onSomethingElse: () => void;
}) {
  return (
    <div className="mt-6 border-t border-white/10 pt-5">
      <p
        className="mb-4 text-[15px] leading-snug text-white/75"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {question}
      </p>
      <div className="flex flex-col gap-2.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            disabled={disabled}
            className="focus-ring group/choice flex items-center justify-between rounded-full border border-white/20 bg-white/[0.06] px-5 py-3.5 text-left text-[15px] text-white backdrop-blur-sm transition-all active:translate-y-px hover:-translate-y-px hover:border-[#C4A87C]/55 hover:bg-white/[0.11] hover:shadow-[0_6px_24px_rgba(196,168,124,0.12)] disabled:cursor-not-allowed disabled:opacity-40"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            <span>{opt}</span>
            <span
              aria-hidden
              className="ml-3 text-white/45 transition-colors group-hover/choice:text-[#C4A87C]"
            >
              →
            </span>
          </button>
        ))}
        <button
          onClick={onSomethingElse}
          disabled={disabled}
          className="focus-ring mt-2 text-[14px] italic text-white/55 transition-colors hover:text-white/85 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Or something else — type it below ↓
        </button>
      </div>
    </div>
  );
}

/* ================= MESSAGE BUBBLE ================= */

function MessageBubble({
  message,
  disabled,
  onSelectChoice,
  onSomethingElse,
  isStreaming = false,
}: {
  message: UIMessage;
  disabled: boolean;
  onSelectChoice: (text: string) => void;
  onSomethingElse: () => void;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        aria-busy={!isUser && isStreaming ? true : undefined}
        className={`${
          isUser
            ? "max-w-[85%] rounded-2xl bg-white px-5 py-3 text-sm leading-relaxed text-black sm:text-base"
            : "max-w-[92%] rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-[15px] leading-[1.7] text-white/90 sm:text-base"
        }`}
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            if (isUser) {
              // user bubble — plain text, preserves newlines
              return (
                <div key={i} className="whitespace-pre-wrap">
                  {part.text}
                </div>
              );
            }
            // AI bubble — split off the ```choices block, render the rest
            // as markdown, render the block as an interactive choice set.
            const { cleanText, choices } = parseChoices(part.text);
            return (
              <div key={i}>
                <MarkdownMessage text={cleanText} />
                {choices && (
                  <MultipleChoice
                    question={choices.question}
                    options={choices.options}
                    disabled={disabled}
                    onSelect={onSelectChoice}
                    onSomethingElse={onSomethingElse}
                  />
                )}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

/* ================= THINKING INDICATOR ================= */

/**
 * While the AI is generating, show the ΙΗΣΟΥΣ ≡ 888 inscription pulsing softly.
 * Replaces the old three-dots indicator. Gives the wait weight.
 */
function ThinkingIndicator() {
  return (
    <div className="flex justify-start" role="status" aria-label="Thinking">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4">
        <span
          aria-hidden
          className="animate-pulse text-[11px] uppercase tracking-[0.4em] text-white/55"
          style={{
            fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
            animationDuration: "1.6s",
          }}
        >
          ΙΗΣΟΥΣ ≡ 888
        </span>
      </div>
    </div>
  );
}

/* ================= LIVE ROTATING MESSAGE ================= */

/**
 * Live encouraging message under the FINDGOD hero. Pulled from a
 * TIME-OF-DAY pool — morning, midday, or evening — mixed with always-true
 * lines so the page feels contextually alive. Each visitor sees something
 * tuned to the moment, not a random library card.
 */
const MORNING_MESSAGES = [
  "Begin with the Word. Everything else can wait.",
  "The day has not won yet. You're here first.",
  "You wake up. The world starts pulling. This room doesn't.",
  "Heavy morning? Start with one verse.",
  "The man who shows up at dawn already won the day.",
  "You opened this before you opened the feed. Good.",
];

const MIDDAY_MESSAGES = [
  "The world is loud. You came here for quiet. Good.",
  "Whatever you carried into today — bring it here.",
  "You don't have to know what to ask. Just start.",
  "Pause is a prayer. You just paused.",
  "Stop scrolling. You already did the hard part.",
  "What's pulling at you right now? Say it plain.",
];

const EVENING_MESSAGES = [
  "The day was loud. The Word is quiet. Sit with it.",
  "Whatever today took from you, begin to take it back.",
  "Brother, you're on the right path. Keep walking.",
  "You're tired of the noise. That's why you're here.",
  "The day is closing. The Word is open. Read.",
  "End the day in the right room.",
];

const ALWAYS_MESSAGES = [
  "Whatever you came here with — you're in the right room.",
  "There is no question too small. No struggle too dark.",
  "The narrow path is rarely crowded. Welcome.",
  "You're not the first man who landed here lost. You won't be the last.",
  "The Word has been waiting for you.",
  "The man who shows up wins. You showed up.",
];

function pickMessageForNow(): string {
  const hour = new Date().getHours();
  const timePool =
    hour < 11
      ? MORNING_MESSAGES
      : hour < 18
        ? MIDDAY_MESSAGES
        : EVENING_MESSAGES;
  // Mix the time-of-day pool with the always-relevant pool so we don't repeat too quickly.
  const combined = [...timePool, ...ALWAYS_MESSAGES];
  return combined[Math.floor(Math.random() * combined.length)];
}

/**
 * Greeting shown on the empty state for authenticated returning visitors.
 * Replaces the generic LiveMessage with something personal and FINDGOD-voiced.
 */
function ReturningGreeting({ firstName }: { firstName: string }) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    const lines =
      hour < 11
        ? [
            `Back at it, ${firstName}.`,
            `Morning, ${firstName}. What's on your mind?`,
            `Good. You showed up again, ${firstName}.`,
          ]
        : hour < 18
          ? [
              `Back at it, ${firstName}.`,
              `${firstName}. What's weighing on you?`,
              `Good to have you back, ${firstName}.`,
            ]
          : [
              `${firstName}. End the day here.`,
              `Back at it, ${firstName}.`,
              `${firstName}. What are you carrying tonight?`,
            ];
    setMessage(lines[Math.floor(Math.random() * lines.length)]);
  }, [firstName]);

  return (
    <p
      className="min-h-[1.6em] max-w-md text-base leading-relaxed text-white/75 sm:text-lg"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      {message ?? "\u00A0"}
    </p>
  );
}

function LiveMessage() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setMessage(pickMessageForNow());
  }, []);

  return (
    <p
      className="min-h-[1.6em] max-w-md text-base leading-relaxed text-white/65 sm:text-lg"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      {message ?? "\u00A0"}
    </p>
  );
}

/* ================= CATEGORY PANEL ================= */

/**
 * Expands when a category chip is active on the home page. Shows 5
 * pinpointed first-person prompts the user can click to start a chat.
 * Mirrors Claude's prompt-category pattern but tuned for FINDGOD voice —
 * every prompt is a real thing a 16–30 yo lost man would actually say.
 */
function CategoryPanel({
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

  // Move focus to the first prompt on open so keyboard users don't have
  // to tab through chrome. Escape closes + returns focus to the trigger
  // chip (the chip re-renders with active=false; browser restores focus
  // to the most recent element with focus, which is the chip).
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

/* ================= INSTAGRAM CTA ================= */

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function InstagramCTA() {
  return (
    <div className="mt-6 flex justify-center sm:mt-8">
      <a
        href="https://instagram.com/findgod"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow FINDGOD on Instagram"
        className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm text-white/75 backdrop-blur-sm transition-all hover:-translate-y-px hover:border-[#C4A87C]/40 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_4px_20px_rgba(196,168,124,0.08)]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <InstagramIcon className="h-[14px] w-[14px]" />
        <span className="text-[13px]">
          Follow{" "}
          <span
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 900,
              letterSpacing: "0.01em",
            }}
          >
            @findgod
          </span>{" "}
          on Instagram
        </span>
      </a>
    </div>
  );
}

/* ================= SIGNUP BLOCKER ================= */

/**
 * The blocker shown when an anonymous visitor hits their free-chat limit.
 * Thin wrapper: the real content (three distinct views — initial / code /
 * success) lives inside SignupForm so chrome can be right-sized per step
 * without this component knowing which step is active.
 *
 * Adds a warm gold-tinted aura behind the card to pull the eye in and
 * signal "this is the moment." The aura is positioned behind via a
 * blurred absolutely-placed sibling, so it stays decorative and doesn't
 * clip the card.
 */
function SignupBlocker() {
  return (
    <div className="relative">
      {/* Warm gold aura — cinematic depth behind the card. Subtle; the
          card is still the hero. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-16 -z-10 rounded-[60px] bg-[radial-gradient(ellipse_at_center,rgba(196,168,124,0.11)_0%,rgba(196,168,124,0.04)_35%,transparent_70%)] blur-3xl"
      />

      {/* Card */}
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.045] to-white/[0.02] px-6 py-10 text-center backdrop-blur-md sm:px-10 sm:py-12"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {/* Top edge highlight — hairline of warm light, like a candle
            glowing just above the card */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C4A87C]/50 to-transparent"
        />

        <SignupForm />
      </div>
    </div>
  );
}
