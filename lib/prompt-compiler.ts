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
 * Stages run concurrently via Promise.all. Output ordering follows the
 * STAGES array position (personality → examples → guardrails → knowledge),
 * not completion order — Promise.all preserves input ordering.
 */

export type CompileOptions = {
  firstName?: string | null;
  userMessage?: string | null;
};

/**
 * Runtime context passed to every stage. Holds read-only inputs plus lazy,
 * memoized shared resources (the user-message embedding, once M2/M4 ship).
 *
 * The embedding is shared so Examples (M2) and Knowledge (M4) trigger ONE
 * OpenAI call per chat turn, not two. First caller starts the fetch;
 * subsequent callers await the same promise. Stubs that don't need it
 * simply never call getEmbedding().
 */
export type CompileContext = {
  firstName: string | null;
  userMessage: string | null;
  getEmbedding: () => Promise<number[] | null>;
};

function createContext(opts: CompileOptions): CompileContext {
  let embeddingPromise: Promise<number[] | null> | null = null;
  return {
    firstName: opts.firstName ?? null,
    userMessage: opts.userMessage ?? null,
    getEmbedding(): Promise<number[] | null> {
      if (embeddingPromise) return embeddingPromise;
      embeddingPromise = (async () => {
        // M2 swaps this for a call into lib/embeddings.ts. Until then
        // every semantic-retrieval stage is a stub, so returning null
        // is correct — a stage that would have used the embedding just
        // returns "" and the compiler skips it.
        return null;
      })();
      return embeddingPromise;
    },
  };
}

type Stage = (ctx: CompileContext) => Promise<string>;

type StageDef = {
  flag: FlagKey;
  run: Stage;
};

async function personalityStage(_ctx: CompileContext): Promise<string> {
  return getPersonalitySection();
}

// NOTE: examplesStage / guardrailsStage / knowledgeStage are stubs until
// M2-M4 ship. Their feature_flags rows (stage_examples_enabled, etc.)
// are pre-seeded as enabled — flipping them to false today is a no-op
// because the stage already returns "". That's intentional — the plumbing
// stays ready so enabling a stage at M2 is a one-file-change, not a
// migration.

async function examplesStage(_ctx: CompileContext): Promise<string> {
  // Milestone 2: tag match first, then top-N semantic via
  // match_example_responses RPC. Uses ctx.getEmbedding() — shared with
  // knowledgeStage so M2+M4 share one embed call per chat turn.
  return "";
}

async function guardrailsStage(_ctx: CompileContext): Promise<string> {
  // Milestone 3: always_active rules + trigger_keywords match on
  // ctx.userMessage (lowercased). Priority orders multiple matches.
  return "";
}

async function knowledgeStage(_ctx: CompileContext): Promise<string> {
  // Milestone 4: ctx.getEmbedding() + match_knowledge_chunks RPC,
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
  // Base prompt and flag map are independent Supabase reads — fetch them
  // concurrently. On a warm ttl-cache hit both resolve in <1ms; on cold
  // start this saves ~30ms of serial latency vs. the previous ordering.
  const [base, flags] = await Promise.all([
    getActiveSystemPrompt({ firstName: opts.firstName }),
    getAllFlags(),
  ]);

  // Master kill switch. Explicit false = legacy path; anything else
  // (true, undefined, read error) keeps the compiler running.
  if (flags.compiler_v2_enabled === false) {
    return base;
  }

  const ctx = createContext(opts);

  // Run enabled stages concurrently. Disabled stages short-circuit to ""
  // without invoking `stage.run`, so per-stage kill switches still skip
  // all work (this matters once stages do real Supabase / OpenAI I/O).
  // Promise.all preserves input ordering, so `additions` stays in
  // STAGES order regardless of which stage resolves first.
  const results = await Promise.all(
    STAGES.map((stage) =>
      flags[stage.flag] === false ? Promise.resolve("") : stage.run(ctx),
    ),
  );

  const additions = results
    .map((r) => (r ?? "").trim())
    .filter((r) => r.length > 0);

  if (additions.length === 0) return base;
  return base + "\n\n" + additions.join("\n\n");
}
