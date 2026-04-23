"use client";

import { type UIMessage } from "ai";
import dynamic from "next/dynamic";
import { MultipleChoice, parseChoices } from "./multiple-choice";

/**
 * Chat transcript UI — a single turn (user or assistant) plus the
 * "thinking" placeholder. Kept together because they all render inside
 * the same `role="log"` container in ChatInterface and share the same
 * bubble visual language.
 *
 * `MarkdownMessage` is dynamic-imported here (not in ChatInterface) so
 * the react-markdown + remark-gfm dep graph (~100KB gzipped) only loads
 * when an AI message actually renders. `ssr: false` is important — a
 * fresh chat has no assistant messages at first paint, so there's no
 * hydration-mismatch risk.
 */
const MarkdownMessage = dynamic(
  () => import("@/components/markdown-message"),
  { ssr: false, loading: () => null },
);

export function MessageBubble({
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

/**
 * While the AI is generating, show the ΙΗΣΟΥΣ ≡ 888 inscription pulsing
 * softly. Replaces the old three-dots indicator — gives the wait weight.
 * `role="status"` + visible aria-label means screen readers announce
 * "Thinking" without reading the decorative Greek characters.
 */
export function ThinkingIndicator() {
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
