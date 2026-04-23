import {
  buildNamedPreamble,
  FINDGOD_SYSTEM_PROMPT_BASE,
} from "./findgod-system-prompt";
import { createServiceClient } from "./supabase/service";
import { makeCache } from "./ttl-cache";

/**
 * Resolve the live system prompt for a chat request.
 *
 * Admin dashboard edits prompt versions in the `prompt_versions` table
 * (is_active=true marks the live one). We cache the active row at module
 * scope for 60s — admin publishes propagate within a minute on warm
 * Fluid Compute instances. Falls back to the file-based prompt when the
 * read fails or no active row exists.
 *
 * The named preamble ("You are speaking with {firstName}...") is
 * prepended locally — Supabase stores only the base text.
 */

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

// Don't cache the empty-string sentinel — means "use file fallback", and
// we want to retry Supabase soon in case the admin seeds a row.
const activePromptCache = makeCache<string>({
  fetcher: fetchActivePromptBase,
  ttlMs: 60_000,
  label: "findgod/prompt",
  shouldCache: (value) => value.length > 0,
});

export async function getActiveSystemPrompt(
  opts: { firstName?: string | null } = {},
): Promise<string> {
  const firstName = opts.firstName?.trim() || null;
  const preamble = buildNamedPreamble(firstName);

  const base = await activePromptCache.get();
  return preamble + (base || FINDGOD_SYSTEM_PROMPT_BASE);
}
