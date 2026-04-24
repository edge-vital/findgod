import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { embed, EMBEDDING_DIMENSIONS } from "@/lib/embeddings";

const ORIGINAL_FETCH = globalThis.fetch;
const ORIGINAL_KEY = process.env.OPENAI_API_KEY;

function validEmbedding(): number[] {
  return new Array(EMBEDDING_DIMENSIONS).fill(0).map((_, i) => i / EMBEDDING_DIMENSIONS);
}

describe("embed()", () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "sk-test-fixture-key";
  });

  afterEach(() => {
    globalThis.fetch = ORIGINAL_FETCH;
    process.env.OPENAI_API_KEY = ORIGINAL_KEY;
    vi.restoreAllMocks();
  });

  it("returns a 1536-dim vector on a successful OpenAI response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [{ embedding: validEmbedding(), index: 0, object: "embedding" }],
        model: "text-embedding-3-small",
        object: "list",
        usage: { prompt_tokens: 5, total_tokens: 5 },
      }),
    }) as unknown as typeof fetch;

    const result = await embed("I am struggling with lust");

    expect(result).not.toBeNull();
    expect(result).toHaveLength(EMBEDDING_DIMENSIONS);
  });

  it("returns null when OPENAI_API_KEY is missing (no fetch call)", async () => {
    delete process.env.OPENAI_API_KEY;
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const result = await embed("anything");

    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns null on a non-200 response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      json: async () => ({ error: { message: "rate limited" } }),
    }) as unknown as typeof fetch;

    const result = await embed("anything");
    expect(result).toBeNull();
  });

  it("returns null on empty / whitespace input without calling fetch", async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    expect(await embed("")).toBeNull();
    expect(await embed("   \n\t ")).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns null on a malformed response body (wrong vector length)", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [{ embedding: [0.1, 0.2, 0.3], index: 0, object: "embedding" }],
        model: "text-embedding-3-small",
        object: "list",
        usage: { prompt_tokens: 5, total_tokens: 5 },
      }),
    }) as unknown as typeof fetch;

    const result = await embed("anything");
    expect(result).toBeNull();
  });

  it("returns null on a network error (fetch rejects)", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;

    const result = await embed("anything");
    expect(result).toBeNull();
  });
});
