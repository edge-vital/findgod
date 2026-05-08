"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getVerseByRef } from "@/lib/todays-verse";
import { InscriptionDivider } from "./inscription-divider";

/**
 * Recursively flatten a React node tree to its plain-text content.
 * Used to read the rendered text of a scripture blockquote so we can
 * regex-match the verse reference.
 */
function extractText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return extractText(props.children);
  }
  return "";
}

/**
 * Extract a scripture reference from a blockquote's rendered text. The
 * AI follows the format `**— Book Chapter:Verse (ESV)**` per the system
 * prompt; after markdown rendering that becomes plain text containing
 * `— Book Chapter:Verse (ESV)`. Only ESV is matched — that's what our
 * curated verse list ships, so it's also what we can render as art.
 */
function extractScriptureRef(text: string): string | null {
  const match = text.match(/—\s*(.+?)\s*\(ESV\)/);
  return match ? match[1].trim() : null;
}

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
        // When the verse is one of the 33 curated entries, render an
        // inline "Save as image" link beneath it. The link points at
        // the Satori-rendered share image route — clicking downloads
        // a 1080×1080 FINDGOD-branded image of the verse.
        blockquote: ({ children }) => {
          const ref = extractScriptureRef(extractText(children));
          const matched = ref ? getVerseByRef(ref) : null;

          return (
            <div className="my-5">
              <blockquote
                className="border-l-2 border-[#C4A87C]/60 bg-white/[0.02] py-3 pl-5 pr-4 text-[17px] italic leading-[1.55] text-white/85"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {children}
              </blockquote>

              {matched && (
                <div className="mt-2 flex justify-end">
                  <a
                    href={`/api/verse-image?ref=${encodeURIComponent(matched.ref)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-white/55 transition-colors hover:text-[#C4A87C]"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                    aria-label={`Save ${matched.ref} as image`}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Save as image
                  </a>
                </div>
              )}
            </div>
          );
        },
        ol: ({ children }) => (
          <ol className="my-3 ml-5 list-decimal space-y-1.5 marker:text-white/60">
            {children}
          </ol>
        ),
        ul: ({ children }) => (
          <ul className="my-3 ml-5 list-disc space-y-1.5 marker:text-white/60">
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
