import { getActiveSystemPrompt } from "./active-system-prompt";
import { getPersonalitySection } from "./personality-stage";

/**
 * Runtime prompt compiler — the single entry point for building the final
 * system prompt sent to Claude on every chat turn.
 *
 * AI Training 2.0 adds four config sources managed via admin.findgod.com:
 *
 *   1. Personality        — structured tone/voice/do's/don'ts form
 *   2. Example responses  — tag- and embedding-matched few-shot Q&A pairs
 *   3. Guardrails         — topic-triggered directives (politics, crisis, etc.)
 *   4. Knowledge library  — pgvector RAG over uploaded PDFs/notes/URLs
 *
 * Each milestone adds one stage. Until a stage ships, its hook is a no-op
 * and we fall through to the legacy `prompt_versions` compiled_text row —
 * so the main chat route can call `compileSystemPrompt()` today without
 * waiting for the full system to be built.
 *
 * Stages run in order (personality → examples → guardrails → knowledge).
 * Each returns a string appended to the base; empty strings are skipped.
 *
 * Per-turn inputs:
 *   firstName    — greeting preamble ("You are speaking with {firstName}...")
 *   userMessage  — the latest user turn, used for:
 *                    · few-shot retrieval (semantic similarity)
 *                    · guardrail trigger matching
 *                    · knowledge chunk retrieval
 *
 * Milestone 0 (current): stages are stubs; output equals the legacy prompt.
 */

export type CompileOptions = {
  firstName?: string | null;
  userMessage?: string | null;
};

// Each stage is async so future stages that hit Supabase/OpenAI fit the
// same signature. The compiler runs them in sequence — most stages are
// cheap and serial is easier to reason about than juggling parallel
// Supabase reads. If latency matters later we can parallelize the ones
// that don't depend on each other.

type Stage = (ctx: CompileOptions) => Promise<string>;

async function personalityStage(_ctx: CompileOptions): Promise<string> {
  return getPersonalitySection();
}

async function examplesStage(_ctx: CompileOptions): Promise<string> {
  // Milestone 2: tag match first, then top-N semantic from
  // example_responses. Embeds userMessage via OpenAI.
  return "";
}

async function guardrailsStage(_ctx: CompileOptions): Promise<string> {
  // Milestone 3: always_active rules + trigger_keywords match on
  // userMessage (lowercased). Priority orders multiple matches.
  return "";
}

async function knowledgeStage(_ctx: CompileOptions): Promise<string> {
  // Milestone 4: embed userMessage, call match_knowledge_chunks RPC,
  // format top-K chunks as a "Source material" block.
  return "";
}

const STAGES: Stage[] = [
  personalityStage,
  examplesStage,
  guardrailsStage,
  knowledgeStage,
];

export async function compileSystemPrompt(
  opts: CompileOptions = {},
): Promise<string> {
  const base = await getActiveSystemPrompt({ firstName: opts.firstName });

  const additions: string[] = [];
  for (const stage of STAGES) {
    const out = await stage(opts);
    if (out && out.trim().length > 0) {
      additions.push(out.trim());
    }
  }

  if (additions.length === 0) return base;
  return base + "\n\n" + additions.join("\n\n");
}
