import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          limit: () => ({
            maybeSingle: async () => ({
              data: {
                tone: "Direct, masculine, ancient.",
                voice_notes: "Short sentences. Scripture leads.",
                dos: ["Quote scripture directly", "Name modern idols"],
                donts: ["No corny church language", "No partisan politics"],
                style_examples: "You weren't built for comfort.",
              },
              error: null,
            }),
          }),
        }),
      }),
    }),
  }),
}));

import { getPersonalitySection } from "@/lib/personality-stage";

describe("personality-stage", () => {
  it("compiles a populated row into the expected markdown shape", async () => {
    const out = await getPersonalitySection();

    expect(out).toContain("## Voice calibration");
    expect(out).toContain("**Tone.** Direct, masculine, ancient.");
    expect(out).toContain("**Voice notes.**");
    expect(out).toContain("**Always do:**");
    expect(out).toContain("- Quote scripture directly");
    expect(out).toContain("- Name modern idols");
    expect(out).toContain("**Never do:**");
    expect(out).toContain("- No corny church language");
    expect(out).toContain("**Example responses that capture the voice:**");
    expect(out).toContain("You weren't built for comfort.");
  });
});
