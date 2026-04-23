import { createServiceClient } from "./supabase/service";

/**
 * Runtime feature flags for the AI Training 2.0 compiler.
 *
 * One row per flag in the `feature_flags` Supabase table. Read on every
 * chat turn but cached per instance for 60s — so the actual Supabase
 * load is ~1 read/minute per warm Fluid Compute instance.
 *
 * Failure model: **fails open.** If Supabase is unreachable or returns
 * an error, we treat all flags as enabled. The kill switch is meant to
 * disable a misbehaving compiler, not to mask an infrastructure outage —
 * and if Supabase is down, the legacy path depends on Supabase too.
 */

const CACHE_TTL_MS = 60_000;

export type FlagKey =
  | "compiler_v2_enabled"
  | "stage_personality_enabled"
  | "stage_examples_enabled"
  | "stage_guardrails_enabled"
  | "stage_knowledge_enabled";

type FlagMap = Partial<Record<FlagKey, boolean>>;

type Cached = {
  value: FlagMap;
  fetchedAt: number;
};

let cache: Cached | null = null;
let inFlight: Promise<FlagMap> | null = null;

async function fetchFlags(): Promise<FlagMap> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("feature_flags")
    .select("key, enabled");

  if (error) {
    throw new Error(`${error.code ?? "supabase_error"}: ${error.message}`);
  }

  const map: FlagMap = {};
  for (const row of data ?? []) {
    map[row.key as FlagKey] = row.enabled;
  }
  return map;
}

async function getFlags(): Promise<FlagMap> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.value;
  }

  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const value = await fetchFlags();
      cache = { value, fetchedAt: Date.now() };
      return value;
    } catch (e) {
      console.error(
        "[findgod/feature-flags] read failed, failing open:",
        e instanceof Error ? `${e.name}: ${e.message}` : "unknown error",
      );
      // Fail open: empty map means no explicit `false`, so isEnabled()
      // returns true for every key. Intentionally do NOT cache so the
      // next request retries.
      return {};
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/**
 * Returns true unless the flag is explicitly set to false in Supabase.
 * Missing rows and read errors both resolve to true.
 */
export async function isEnabled(key: FlagKey): Promise<boolean> {
  const flags = await getFlags();
  return flags[key] !== false;
}

/**
 * Batch helper — saves repeated cache lookups when a caller needs
 * several flags in one code path (e.g. the compiler checking master +
 * per-stage in the same call).
 */
export async function getAllFlags(): Promise<FlagMap> {
  return getFlags();
}

