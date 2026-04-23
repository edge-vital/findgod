import { createServiceClient } from "./supabase/service";

/**
 * Reads the active personality_config row and compiles it into a
 * markdown block that the prompt compiler appends to every chat turn.
 *
 * Cached per-instance with the same 60s TTL the legacy active-system-
 * prompt uses, so Fluid Compute warm instances hit Supabase roughly
 * once a minute per cold start.
 *
 * Empty string is returned when:
 *   - No active row exists (fresh install, or Jones disabled it by
 *     having no rows with is_active=true)
 *   - Every field is blank
 *   - Supabase read fails (swallowed — we fall back to the base prompt)
 */

const CACHE_TTL_MS = 60_000;

type PersonalityRow = {
  tone: string | null;
  voice_notes: string | null;
  dos: string[] | null;
  donts: string[] | null;
  style_examples: string | null;
};

type CachedSection = {
  value: string;
  fetchedAt: number;
};

let cache: CachedSection | null = null;
let inFlight: Promise<string> | null = null;

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

  // Clear banner so the model knows this block is authoritative and
  // overrides any conflicting style guidance from earlier in the prompt.
  parts.push(
    "## Voice calibration\n" +
      "_The rules below are the live, admin-set voice. When they conflict with anything earlier in this prompt, follow these._",
  );

  if (tone) parts.push(`**Tone.** ${tone}`);
  if (voice) parts.push(`**Voice notes.**\n${voice}`);
  if (dos.length > 0) {
    parts.push(
      "**Always do:**\n" + dos.map((d) => `- ${d}`).join("\n"),
    );
  }
  if (donts.length > 0) {
    parts.push(
      "**Never do:**\n" + donts.map((d) => `- ${d}`).join("\n"),
    );
  }
  if (examples) {
    parts.push(
      "**Example responses that capture the voice:**\n" + examples,
    );
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

export async function getPersonalitySection(): Promise<string> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.value;
  }

  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const value = await fetchSection();
      cache = { value, fetchedAt: Date.now() };
      return value;
    } catch (e) {
      console.error(
        "[findgod/personality-stage] read failed, skipping section:",
        e instanceof Error ? `${e.name}: ${e.message}` : "unknown error",
      );
      // Cache the empty result briefly so we don't hammer Supabase on
      // sustained errors. TTL still applies → next hit retries.
      cache = { value: "", fetchedAt: Date.now() };
      return "";
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

export function invalidatePersonalityCache(): void {
  cache = null;
}
