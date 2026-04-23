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

import { getActiveSystemPrompt } from "@/lib/active-system-prompt";
import { getAllFlags } from "@/lib/feature-flags";
import { getPersonalitySection } from "@/lib/personality-stage";
import { compileSystemPrompt } from "@/lib/prompt-compiler";

describe("prompt-compiler", () => {
  beforeEach(() => {
    vi.mocked(getActiveSystemPrompt).mockResolvedValue("BASE_PROMPT");
    vi.mocked(getAllFlags).mockResolvedValue({});
    vi.mocked(getPersonalitySection).mockResolvedValue("");
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
