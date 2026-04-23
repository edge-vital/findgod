"use client";

/**
 * ```choices fenced-block parsing + the MultipleChoice button panel.
 *
 * The system prompt instructs Claude to end meaningful responses with
 * exactly one fenced block:
 *   ```choices
 *   { "question": "...", "options": ["...", "..."] }
 *   ```
 * The parser strips that block from the rendered text and returns a
 * typed `Choices` object; MessageBubble renders it as a cliffhanger +
 * interactive buttons. Clicking an option sends it as the next user
 * message. "Something else" focuses the free-text input instead.
 */

export type Choices = { question: string; options: string[] };

/**
 * Pull a ```choices fenced block out of an AI message.
 *
 * During streaming the closing ``` doesn't exist yet, which previously
 * leaked the raw opener (```choices\n{"question":"...) into the UI as
 * a visible code block. We now hide everything from the opening fence
 * onward as soon as it appears — once the block closes we parse it
 * into real clickable choices.
 */
export function parseChoices(text: string): {
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
      // malformed JSON — fall through and strip the opener anyway so
      // the raw block never shows up in the rendered response.
    }
  }

  // Mid-stream: opener exists but the closing fence hasn't arrived yet
  // (or the JSON is malformed). Strip everything from the opener
  // forward so the user never sees the raw payload.
  const openerIdx = text.indexOf("```choices");
  if (openerIdx !== -1) {
    return { cleanText: text.slice(0, openerIdx).trimEnd(), choices: null };
  }

  return { cleanText: text, choices: null };
}

/**
 * Renders the pinpointed cliffhanger question + pre-written answer
 * options from a ```choices block. Clicking an option sends it as the
 * next user message. "Something else" focuses the free-text input.
 */
export function MultipleChoice({
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
