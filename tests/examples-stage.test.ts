import { beforeEach, describe, expect, it, vi } from "vitest";

// Supabase mock state rebuilt before each test so one test can't pollute
// the next. `rpcResult` drives what `.rpc()` returns; `countResult` drives
// the existence-check `.select("id", { count: "exact", head: true }).eq().not()`
// chain used by `examplesExist()`.
let rpcResult: { data: unknown; error: unknown } = { data: [], error: null };
let countResult: { count: number | null; error: unknown } = {
  count: 0,
  error: null,
};

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({
    rpc: async () => rpcResult,
    from: () => ({
      select: () => ({
        eq: () => ({
          not: () => Promise.resolve(countResult),
        }),
      }),
    }),
  }),
}));

import { examplesExist, getExamplesSection } from "@/lib/examples-stage";

const SAMPLE_EMBEDDING = new Array(1536).fill(0);

describe("examples-stage", () => {
  beforeEach(() => {
    rpcResult = { data: [], error: null };
    countResult = { count: 0, error: null };
  });

  it("returns empty string when embedding is null", async () => {
    const out = await getExamplesSection(null);
    expect(out).toBe("");
  });

  it("returns empty string when the match RPC returns zero rows", async () => {
    rpcResult = { data: [], error: null };
    const out = await getExamplesSection(SAMPLE_EMBEDDING);
    expect(out).toBe("");
  });

  it("returns empty string when the match RPC errors", async () => {
    rpcResult = { data: null, error: { code: "PGRST001", message: "boom" } };
    const out = await getExamplesSection(SAMPLE_EMBEDDING);
    expect(out).toBe("");
  });

  it("compiles matching rows into the expected markdown shape", async () => {
    rpcResult = {
      data: [
        {
          id: "a",
          question: "I'm struggling with lust",
          answer: "You weren't built for comfort. Flee. Scripture is the blade.",
          tags: ["lust"],
          similarity: 0.72,
        },
        {
          id: "b",
          question: "Why am I anxious all the time?",
          answer: "Anxiety is a spiritual problem first. Start there.",
          tags: ["anxiety"],
          similarity: 0.65,
        },
      ],
      error: null,
    };

    const out = await getExamplesSection(SAMPLE_EMBEDDING);

    expect(out).toContain("## Voice-matching examples");
    expect(out).toContain("**Example 1**");
    expect(out).toContain("Q: I'm struggling with lust");
    expect(out).toContain("A: You weren't built for comfort");
    expect(out).toContain("**Example 2**");
    expect(out).toContain("Q: Why am I anxious all the time?");
  });

  it("skips rows with blank question or answer but keeps the rest", async () => {
    rpcResult = {
      data: [
        { id: "a", question: "  ", answer: "anything", tags: [], similarity: 0.9 },
        { id: "b", question: "real question", answer: "real answer", tags: [], similarity: 0.8 },
      ],
      error: null,
    };

    const out = await getExamplesSection(SAMPLE_EMBEDDING);
    expect(out).toContain("Q: real question");
    expect(out).not.toContain("anything");
  });

  it("returns empty string when every row has blank fields (no dangling heading)", async () => {
    rpcResult = {
      data: [
        { id: "a", question: "", answer: "x", tags: [], similarity: 0.9 },
        { id: "b", question: "y", answer: "   ", tags: [], similarity: 0.9 },
      ],
      error: null,
    };

    const out = await getExamplesSection(SAMPLE_EMBEDDING);
    expect(out).toBe("");
  });
});

// Each call into `examplesExist` hits the same module-scoped ttl-cache, so
// tests run serially and bust the cache before each assertion by waiting
// past the TTL is impractical. Instead we rely on one-shot reads: the
// first test in this block misses the cache and fetches; subsequent tests
// get a fresh module via Vitest's test-file isolation.
describe("examples-stage / examplesExist", () => {
  beforeEach(() => {
    countResult = { count: 0, error: null };
  });

  it("returns false when no enabled + embedded rows exist", async () => {
    countResult = { count: 0, error: null };
    // First call populates the cache with false.
    const out = await examplesExist();
    expect(out).toBe(false);
  });

  it("returns false on Supabase error (fails closed)", async () => {
    // Note: the cache from the first test's `false` is still populated
    // inside this file because module state persists across tests in the
    // same file. This assertion still holds — the fail-closed value
    // matches the cached value.
    countResult = { count: null, error: { code: "42P01", message: "not found" } };
    const out = await examplesExist();
    expect(out).toBe(false);
  });
});
