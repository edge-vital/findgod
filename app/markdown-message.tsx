"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { InscriptionDivider } from "./inscription-divider";

/**
 * Renders an AI response's streamed text as Markdown with FINDGOD-voiced
 * components (scripture blockquotes in Georgia italic, gold-accented
 * lists, inscription dividers for horizontal rules, etc).
 *
 * Extracted into its own module so `chat-interface.tsx` can dynamic-
 * import it. `react-markdown` + `remark-gfm` pull in a deep unified /
 * mdast / micromark dep graph (~100KB gzipped); eager-importing meant
 * every visitor who bounced without sending a message still downloaded
 * it. Now it loads on the first AI message render, while Claude is
 * already streaming — the user never sees the latency.
 */
export default function MarkdownMessage({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="mb-3 leading-[1.7] last:mb-0">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-white">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        // Scripture blockquote — ST06 system italic (Georgia serif).
        blockquote: ({ children }) => (
          <blockquote
            className="my-5 border-l-2 border-[#C4A87C]/60 bg-white/[0.02] py-3 pl-5 pr-4 text-[17px] italic leading-[1.55] text-white/85"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {children}
          </blockquote>
        ),
        ol: ({ children }) => (
          <ol className="my-3 ml-5 list-decimal space-y-1.5 marker:text-white/40">
            {children}
          </ol>
        ),
        ul: ({ children }) => (
          <ul className="my-3 ml-5 list-disc space-y-1.5 marker:text-white/40">
            {children}
          </ul>
        ),
        li: ({ children }) => <li className="leading-[1.7]">{children}</li>,
        hr: () => <InscriptionDivider />,
        code: ({ children }) => (
          <code className="rounded bg-white/[0.08] px-1.5 py-0.5 text-sm font-mono">
            {children}
          </code>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-white/40 underline-offset-2 hover:text-white hover:decoration-white/80"
          >
            {children}
          </a>
        ),
        h1: ({ children }) => (
          <h1 className="mb-2 mt-4 text-lg font-semibold text-white">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-2 mt-4 text-base font-semibold text-white">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 mt-3 text-base font-semibold text-white">
            {children}
          </h3>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
