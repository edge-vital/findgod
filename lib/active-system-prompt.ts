import { get } from "@vercel/edge-config";
import {
  buildNamedPreamble,
  FINDGOD_SYSTEM_PROMPT_BASE,
} from "./findgod-system-prompt";

/**
 * Resolve the live system prompt for a chat request.
 *
 * Reads the admin-editable base prompt from Vercel Edge Config under the
 * key `active_prompt`. If the key is empty, the read fails, or the
 * `EDGE_CONFIG` env var isn't set (local dev without the store linked),
 * falls back to the file-based prompt in `findgod-system-prompt.ts`.
 *
 * The named preamble ("You are speaking with {firstName}...") is prepended
 * locally — Edge Config stores only the base text so the admin dashboard
 * editor never has to handle per-user branching.
 *
 * Why Edge Config over Supabase: sub-10ms reads globally, no DB hit on
 * every chat turn, and updates propagate in seconds after the admin
 * dashboard publishes a new version. Supabase stays the source of truth
 * for prompt history and drafts.
 */
export async function getActiveSystemPrompt(
  opts: { firstName?: string | null } = {},
): Promise<string> {
  const firstName = opts.firstName?.trim() || null;
  const preamble = buildNamedPreamble(firstName);

  // If EDGE_CONFIG isn't configured (local dev, new project before linking),
  // skip the read entirely to avoid the library throwing.
  if (process.env.EDGE_CONFIG) {
    try {
      const value = await get<string>("active_prompt");
      if (typeof value === "string" && value.length > 0) {
        return preamble + value;
      }
    } catch (e) {
      // Log the name + message only — the full error object can contain
      // connection-string fragments we don't want in downstream log sinks.
      console.error(
        "[findgod/prompt] Edge Config read failed, using file fallback:",
        e instanceof Error ? `${e.name}: ${e.message}` : "unknown error",
      );
    }
  }

  return preamble + FINDGOD_SYSTEM_PROMPT_BASE;
}
