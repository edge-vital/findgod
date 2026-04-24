import { createServiceClient } from "./supabase/service";
import { makeCache } from "./ttl-cache";

/**
 * Milestone 2 — Examples stage.
 *
 * At chat time, fetch the top-N `example_responses` whose `question` is
 * semantically closest to the current user message (via the HNSW cosine
 * index on `question_embedding`) and format them as a "voice-matching"
 * markdown block appended to the system prompt.
 *
 * Called from the prompt compiler after `ctx.getEmbedding()` resolves.
 * If the embedding is null (OpenAI outage, missing API key, empty input)
 * this returns "" without touching Supabase.
 *
 * `examplesExist()` is a companion check the compiler uses to skip the
 * embed call entirely when the table is empty. Cached 60s per instance
 * — same TTL contract as personality / prompt / feature flags.
 *
 * Match output deliberately NOT cached: the query depends on the
 * per-turn user message, so each call is a one-shot. The HNSW index +
 * Fluid Compute keep the round-trip comfortably under 50ms at our scale.
 */

type ExampleRow = {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  similarity: number;
};

// Tune once we have real usage data. 0.3 is generous — catches loose
// topical matches. We can lift to 0.5+ if examples start firing on
// irrelevant turns. Starting generous because the admin tab ships empty;
// Jones will seed a handful of examples and want to see them light up.
const MATCH_COUNT = 3;
const MIN_SIMILARITY = 0.3;

/**
 * True when at least one enabled row with a non-null embedding exists.
 * Used by the compiler to skip the embed call entirely when the table is
 * empty — saves ~100-200ms + OpenAI tokens per turn while the admin UI
 * is still unbuilt and Jones hasn't seeded examples yet.
 *
 * Fails CLOSED (returns false on Supabase error) so a transient outage
 * doesn't trigger a wasted embed call. If Supabase is down, the RPC
 * would have failed anyway — skipping early is strictly better.
 */
async function fetchHasExamples(): Promise<boolean> {
  const supabase = createServiceClient();
  const { count, error } = await supabase
    .from("example_responses")
    .select("id", { count: "exact", head: true })
    .eq("enabled", true)
    .not("question_embedding", "is", null);

  if (error) {
    console.error(
      "[findgod/examples-stage] existence check failed:",
      error.code ?? "unknown",
    );
    return false;
  }

  return (count ?? 0) > 0;
}

const existenceCache = makeCache<boolean>({
  fetcher: fetchHasExamples,
  ttlMs: 60_000,
  label: "findgod/examples-stage:exists",
});

export async function examplesExist(): Promise<boolean> {
  return (await existenceCache.get()) ?? false;
}

export async function getExamplesSection(
  embedding: number[] | null,
): Promise<string> {
  if (!embedding) return "";

  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("match_example_responses", {
    query_embedding: embedding,
    match_count: MATCH_COUNT,
    min_similarity: MIN_SIMILARITY,
  });

  if (error) {
    // Log only error.code — PostgREST error.message on RPCs can echo the
    // query args, which for us means leaking the user's message embedding
    // (and by proxy, the message itself) into Vercel logs.
    console.error(
      "[findgod/examples-stage] match RPC failed:",
      error.code ?? "unknown",
    );
    return "";
  }

  const rows = (data ?? []) as ExampleRow[];
  if (rows.length === 0) return "";

  return compile(rows);
}

function compile(rows: ExampleRow[]): string {
  const parts: string[] = [];

  parts.push(
    "## Voice-matching examples\n" +
      "_When the moment fits, answer in the spirit of these. Don't parrot — learn the shape, tone, and rhythm._",
  );

  rows.forEach((row, i) => {
    const q = row.question.trim();
    const a = row.answer.trim();
    if (!q || !a) return;
    parts.push(`**Example ${i + 1}**\nQ: ${q}\nA: ${a}`);
  });

  // If every row was blank (shouldn't happen — admin UI will require both
  // fields — but defensive) we'd have only the header. Suppress rather
  // than inject a dangling heading into the prompt.
  if (parts.length === 1) return "";

  return parts.join("\n\n");
}
