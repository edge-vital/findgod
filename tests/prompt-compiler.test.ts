import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/active-system-prompt", () => ({
  getActiveSystemPrompt: vi.fn(),
}));
vi.mock("@/lib/feature-flags", () => ({
  getAllFlags: vi.fn(),
}));
vi.mock("@/lib/personality-stage", () => ({
  getPersonalitySection: vi.fn(),
}));
vi.mock("@/lib/examples-stage", () => ({
  examplesExist: vi.fn(),
  getExamplesSection: vi.fn(),
}));
vi.mock("@/lib/embeddings", () => ({
  embed: vi.fn(),
}));

import { getActiveSystemPrompt } from "@/lib/active-system-prompt";
import { embed } from "@/lib/embeddings";
import { examplesExist, getExamplesSection } from "@/lib/examples-stage";
import { getAllFlags } from "@/lib/feature-flags";
import { getPersonalitySection } from "@/lib/personality-stage";
import { compileSystemPrompt, createContext } from "@/lib/prompt-compiler";

describe("prompt-compiler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getActiveSystemPrompt).mockResolvedValue("BASE_PROMPT");
    vi.mocked(getAllFlags).mockResolvedValue({});
    vi.mocked(getPersonalitySection).mockResolvedValue("");
    vi.mocked(examplesExist).mockResolvedValue(false);
    vi.mocked(getExamplesSection).mockResolvedValue("");
    vi.mocked(embed).mockResolvedValue(null);
  });

  it("returns the base prompt only when compiler_v2_enabled is false", async () => {
    vi.mocked(getAllFlags).mockResolvedValue({ compiler_v2_enabled: false });
    vi.mocked(getPersonalitySection).mockResolvedValue("PERSONALITY_BLOCK");

    const out = await compileSystemPrompt();

    expect(out).toBe("BASE_PROMPT");
    expect(getPersonalitySection).not.toHaveBeenCalled();
  });

  it("skips a stage whose per-stage flag is explicitly false", async () => {
    vi.mocked(getAllFlags).mockResolvedValue({
      stage_personality_enabled: false,
    });
    vi.mocked(getPersonalitySection).mockResolvedValue("PERSONALITY_BLOCK");

    const out = await compileSystemPrompt();

    expect(out).toBe("BASE_PROMPT");
    expect(out).not.toContain("PERSONALITY_BLOCK");
    expect(getPersonalitySection).not.toHaveBeenCalled();
  });

  it("fails open — empty flag map still runs every stage", async () => {
    vi.mocked(getAllFlags).mockResolvedValue({});
    vi.mocked(getPersonalitySection).mockResolvedValue("PERSONALITY_BLOCK");

    const out = await compileSystemPrompt();

    expect(out).toContain("BASE_PROMPT");
    expect(out).toContain("PERSONALITY_BLOCK");
    expect(getPersonalitySection).toHaveBeenCalledTimes(1);
  });
});

describe("CompileContext.getEmbedding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(embed).mockResolvedValue(new Array(1536).fill(0));
  });

  it("calls embed exactly once even when invoked concurrently", async () => {
    const ctx = createContext({ userMessage: "I'm struggling with lust" });

    const [a, b, c] = await Promise.all([
      ctx.getEmbedding(),
      ctx.getEmbedding(),
      ctx.getEmbedding(),
    ]);

    expect(a).toBe(b);
    expect(b).toBe(c);
    expect(embed).toHaveBeenCalledTimes(1);
  });

  it("returns null without calling embed when userMessage is missing or blank", async () => {
    const blankCtx = createContext({ userMessage: "   " });
    expect(await blankCtx.getEmbedding()).toBeNull();

    const missingCtx = createContext({});
    expect(await missingCtx.getEmbedding()).toBeNull();

    expect(embed).not.toHaveBeenCalled();
  });
});
