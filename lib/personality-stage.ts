import { createServiceClient } from "./supabase/service";
import { makeCache } from "./ttl-cache";

/**
 * Reads the active personality_config row and compiles it into a
 * markdown block that the prompt compiler appends to every chat turn.
 *
 * Per-instance 60s cache (via `lib/ttl-cache.ts`); Fluid Compute warm
 * instances hit Supabase ~1x/minute per cold start.
 *
 * Returns "" when:
 *   - No active row exists
 *   - Every field is blank
 *   - Supabase read fails (swallowed by the cache helper)
 */

type PersonalityRow = {
  tone: string | null;
  voice_notes: string | null;
  dos: string[] | null;
  donts: string[] | null;
  style_examples: string | null;
};

function compile(row: PersonalityRow): string {
  const parts: string[] = [];
  const tone = (row.tone ?? "").trim();
  const voice = (row.voice_notes ?? "").trim();
  const dos = (row.dos ?? []).map((s) => s.trim()).filter(Boolean);
  const donts = (row.donts ?? []).map((s) => s.trim()).filter(Boolean);
  const examples = (row.style_examples ?? "").trim();

  if (!tone && !voice && dos.length === 0 && donts.length === 0 && !examples) {
    return "";
  }

  parts.push(
    "## Voice calibration\n" +
      "_The rules below are the live, admin-set voice. When they conflict with anything earlier in this prompt, follow these._",
  );

  if (tone) parts.push(`**Tone.** ${tone}`);
  if (voice) parts.push(`**Voice notes.**\n${voice}`);
  if (dos.length > 0) {
    parts.push("**Always do:**\n" + dos.map((d) => `- ${d}`).join("\n"));
  }
  if (donts.length > 0) {
    parts.push("**Never do:**\n" + donts.map((d) => `- ${d}`).join("\n"));
  }
  if (examples) {
    parts.push("**Example responses that capture the voice:**\n" + examples);
  }

  return parts.join("\n\n");
}

async function fetchSection(): Promise<string> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("personality_config")
    .select("tone, voice_notes, dos, donts, style_examples")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle<PersonalityRow>();

  if (error) {
    throw new Error(`${error.code ?? "supabase_error"}: ${error.message}`);
  }
  if (!data) return "";
  return compile(data);
}

const personalityCache = makeCache<string>({
  fetcher: fetchSection,
  ttlMs: 60_000,
  label: "findgod/personality-stage",
});

export async function getPersonalitySection(): Promise<string> {
  const value = await personalityCache.get();
  return value ?? "";
}
