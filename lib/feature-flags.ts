import { createServiceClient } from "./supabase/service";
import { makeCache } from "./ttl-cache";

/**
 * Runtime feature flags for the AI Training 2.0 compiler.
 *
 * One row per flag in the `feature_flags` Supabase table. Read on every
 * chat turn but cached per instance for 60s — Supabase load is
 * ~1 read/minute per warm Fluid Compute instance.
 *
 * **Fails open.** If Supabase is unreachable or the table is missing,
 * the cache helper returns undefined → we treat every flag as enabled.
 * The kill switch is meant to disable a misbehaving compiler, not to
 * mask an infrastructure outage.
 *
 * Only an explicit `false` disables a stage. Missing rows + read errors
 * both resolve to "enabled."
 */

export type FlagKey =
  | "compiler_v2_enabled"
  | "stage_personality_enabled"
  | "stage_examples_enabled"
  | "stage_guardrails_enabled"
  | "stage_knowledge_enabled";

type FlagMap = Partial<Record<FlagKey, boolean>>;

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

const flagsCache = makeCache<FlagMap>({
  fetcher: fetchFlags,
  ttlMs: 60_000,
  label: "findgod/feature-flags",
});

/**
 * Returns true unless the flag is explicitly set to false in Supabase.
 * Missing rows and read errors both resolve to true.
 */
export async function isEnabled(key: FlagKey): Promise<boolean> {
  const flags = (await flagsCache.get()) ?? {};
  return flags[key] !== false;
}

/**
 * Batch helper — saves repeated cache lookups when a caller needs
 * several flags in one code path (e.g. the compiler checking master +
 * per-stage in the same call).
 */
export async function getAllFlags(): Promise<FlagMap> {
  return (await flagsCache.get()) ?? {};
}
