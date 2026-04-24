/**
 * OpenAI embeddings — shared helper for the prompt compiler's semantic
 * retrieval stages (M2 Examples, M4 Knowledge).
 *
 * Model: `text-embedding-3-small` (1536-dim). Matches the `vector(1536)`
 * columns on `example_responses.question_embedding` and
 * `knowledge_chunks.embedding`, plus the HNSW cosine indexes shipped in
 * migration `20260423000003_pgvector_hnsw.sql`.
 *
 * Uses `fetch` directly (no SDK) so we stay on the lean side and can swap
 * to Voyage / Cohere / self-hosted later by replacing one function.
 *
 * **Fails open.** Any error — missing API key, network blip, 429, 500 —
 * resolves to `null`. Callers must treat null as "no semantic retrieval
 * this turn" and skip their stage gracefully. The chat experience must
 * never hard-fail because an embedding call failed.
 *
 * No retries, no backoff. At one call per chat turn and aggressive 10s
 * timeout, the right failure response is to skip examples for this turn
 * rather than delay the user's first token.
 */

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";
const EMBEDDING_TIMEOUT_MS = 10_000;

type OpenAIEmbeddingResponse = {
  data: Array<{ embedding: number[]; index: number; object: string }>;
  model: string;
  object: string;
  usage: { prompt_tokens: number; total_tokens: number };
};

/**
 * Embed a single string. Returns the 1536-dim vector on success, `null`
 * on any failure (missing key, network error, non-200 response, malformed
 * body, timeout).
 *
 * Input is trimmed before sending. An empty or whitespace-only input
 * returns `null` without making the API call.
 */
export async function embed(text: string): Promise<number[] | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error(
      "[findgod/embeddings] OPENAI_API_KEY is not set — skipping embedding call. " +
        "Examples + Knowledge stages will no-op until the key is configured in Vercel.",
    );
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EMBEDDING_TIMEOUT_MS);

  try {
    const res = await fetch(OPENAI_EMBEDDINGS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: trimmed,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      // Log status only — OpenAI error bodies sometimes echo the input
      // text back, which for the chat route would mean leaking user
      // messages (sensitive category) into Vercel logs.
      console.error(
        `[findgod/embeddings] OpenAI returned ${res.status} ${res.statusText}`,
      );
      return null;
    }

    const body = (await res.json()) as OpenAIEmbeddingResponse;
    const vector = body?.data?.[0]?.embedding;

    if (!Array.isArray(vector) || vector.length !== EMBEDDING_DIMENSIONS) {
      console.error(
        `[findgod/embeddings] Unexpected response shape: vector length ${vector?.length ?? "missing"}`,
      );
      return null;
    }

    return vector;
  } catch (e) {
    // AbortError (timeout), network error, JSON parse error — all land here.
    console.error(
      "[findgod/embeddings] fetch failed:",
      e instanceof Error ? `${e.name}: ${e.message}` : "unknown error",
    );
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
