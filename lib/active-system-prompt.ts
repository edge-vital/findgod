import {
  buildNamedPreamble,
  FINDGOD_SYSTEM_PROMPT_BASE,
} from "./findgod-system-prompt";
import { createServiceClient } from "./supabase/service";

/**
 * Resolve the live system prompt for a chat request.
 *
 * The admin dashboard edits prompt versions in the Supabase
 * `prompt_versions` table (is_active=true marks the live one). Reading
 * Supabase on every chat turn would add a round-trip to first-token
 * latency, so we cache the active prompt at module scope with a short
 * TTL. Vercel Fluid Compute reuses function instances across concurrent
 * requests, so in practice the vast majority of chat turns hit the cache.
 *
 * Cache is a per-instance in-memory variable — no need for Redis. When
 * an admin publishes a new version, a fresh request within a stale
 * instance will see the old prompt for up to TTL seconds before re-reading.
 * That's the acceptable trade for zero infra.
 *
 * Falls back to the file-based prompt (lib/findgod-system-prompt.ts) when:
 *   - Supabase is unreachable
 *   - The query errors
 *   - No row has is_active=true (fresh project, not yet seeded)
 *
 * The named preamble ("You are speaking with {firstName}...") is prepended
 * locally — Supabase stores only the base text so the admin dashboard
 * editor never has to handle per-user branching.
 */

// 60-second cache TTL. Fast enough that admin publishes feel live (users
// see the new prompt within a minute), slow enough that we only hit
// Supabase ~1x/minute per warm instance.
const CACHE_TTL_MS = 60_000;

type CachedPrompt = {
  value: string;
  fetchedAt: number;
};

// Module-scoped cache. Reset per-cold-start; reused across warm requests.
let cache: CachedPrompt | null = null;

// In-flight promise dedupe: if multiple requests hit an expired cache at
// once, we want ONE Supabase read, not N. Subsequent requests share the
// same promise while the fetch is pending.
let inFlight: Promise<string> | null = null;

async function fetchActivePromptBase(): Promise<string> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("prompt_versions")
    .select("compiled_text")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`${error.code ?? "supabase_error"}: ${error.message}`);
  }

  const compiled = data?.compiled_text;
  if (typeof compiled === "string" && compiled.length > 0) {
    return compiled;
  }

  // No active row — caller will use the file fallback.
  return "";
}

async function getActivePromptBase(): Promise<string> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.value;
  }

  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const value = await fetchActivePromptBase();
      // Only cache non-empty values. Empty means "use file fallback", and
      // we don't want to cache that — we want to retry Supabase soon in
      // case the admin seeds a row.
      if (value) {
        cache = { value, fetchedAt: Date.now() };
      }
      return value;
    } catch (e) {
      // Log name + message only. Swallow for the caller so it falls back.
      console.error(
        "[findgod/prompt] Supabase read failed, using file fallback:",
        e instanceof Error ? `${e.name}: ${e.message}` : "unknown error",
      );
      return "";
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

export async function getActiveSystemPrompt(
  opts: { firstName?: string | null } = {},
): Promise<string> {
  const firstName = opts.firstName?.trim() || null;
  const preamble = buildNamedPreamble(firstName);

  const base = await getActivePromptBase();
  return preamble + (base || FINDGOD_SYSTEM_PROMPT_BASE);
}
