import { getActiveSystemPrompt } from "./active-system-prompt";
import { getAllFlags, type FlagKey } from "./feature-flags";
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
 * Each milestone adds one stage. Until a stage ships, its hook is a no-op.
 *
 * Kill switches live in the `feature_flags` Supabase table:
 *   - compiler_v2_enabled       — master switch; off = legacy path (base prompt only)
 *   - stage_personality_enabled — skip personality stage
 *   - stage_examples_enabled    — skip examples stage
 *   - stage_guardrails_enabled  — skip guardrails stage
 *   - stage_knowledge_enabled   — skip knowledge stage
 *
 * Flags fail open: Supabase outage or missing rows = compiler runs normally.
 * Only an explicit `false` disables a stage. Cached 60s per instance.
 *
 * Stages run in order (personality → examples → guardrails → knowledge).
 * Each returns a string appended to the base; empty strings are skipped.
 */

export type CompileOptions = {
  firstName?: string | null;
  userMessage?: string | null;
};

// Each stage is async so future stages that hit Supabase/OpenAI fit the
// same signature. The compiler runs them in sequence — most stages are
// cheap and serial is easier to reason about than juggling parallel
// Supabase reads. Block 3 of the pre-M2 hardening will parallelize
// independent stages; keeping serial until then.

type Stage = (ctx: CompileOptions) => Promise<string>;

type StageDef = {
  flag: FlagKey;
  run: Stage;
};

async function personalityStage(_ctx: CompileOptions): Promise<string> {
  return getPersonalitySection();
}

// NOTE: examplesStage / guardrailsStage / knowledgeStage are stubs until
// M2-M4 ship. Their feature_flags rows (stage_examples_enabled, etc.)
// are pre-seeded as enabled — flipping them to false today is a no-op
// because the stage already returns "". That's intentional — the plumbing
// stays ready so enabling a stage at M2 is a one-file-change, not a
// migration.

async function examplesStage(_ctx: CompileOptions): Promise<string> {
  // Milestone 2: tag match first, then top-N semantic from
  // example_responses. Embeds userMessage via OpenAI — shared with
  // knowledgeStage via CompileContext so M2+M4 share one embed call.
  return "";
}

async function guardrailsStage(_ctx: CompileOptions): Promise<string> {
  // Milestone 3: always_active rules + trigger_keywords match on
  // userMessage (lowercased). Priority orders multiple matches.
  return "";
}

async function knowledgeStage(_ctx: CompileOptions): Promise<string> {
  // Milestone 4: embed userMessage, call match_knowledge_chunks RPC,
  // format top-K chunks as a "Source material" block with spotlighting
  // (<source id="X">...</source>) to resist prompt injection from
  // untrusted document content.
  return "";
}

const STAGES: StageDef[] = [
  { flag: "stage_personality_enabled", run: personalityStage },
  { flag: "stage_examples_enabled",    run: examplesStage },
  { flag: "stage_guardrails_enabled",  run: guardrailsStage },
  { flag: "stage_knowledge_enabled",   run: knowledgeStage },
];

export async function compileSystemPrompt(
  opts: CompileOptions = {},
): Promise<string> {
  const base = await getActiveSystemPrompt({ firstName: opts.firstName });

  // Master kill switch. Explicit false = legacy path; anything else
  // (true, undefined, read error) keeps the compiler running.
  const flags = await getAllFlags();
  if (flags.compiler_v2_enabled === false) {
    return base;
  }

  const additions: string[] = [];
  for (const stage of STAGES) {
    if (flags[stage.flag] === false) continue;
    const out = await stage.run(opts);
    if (out && out.trim().length > 0) {
      additions.push(out.trim());
    }
  }

  if (additions.length === 0) return base;
  return base + "\n\n" + additions.join("\n\n");
}
