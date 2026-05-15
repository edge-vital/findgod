"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getVerseByRef } from "@/lib/todays-verse";

/**
 * Server actions for the Save-the-verse feature.
 *
 * Fail-open until the `saved_verses` migration is applied:
 * - Save → returns `{ ok: false, reason: "pending_setup" }`; UI shows a
 *   soft toast instead of an error.
 * - List → returns empty array.
 * - Unsave → no-op.
 *
 * This lets the UI ship + propagate to production without waiting for
 * dashboard access. When Jones applies `20260515000001_saved_verses.sql`,
 * the feature comes alive with zero further code changes.
 *
 * Safety guards:
 * - Verse refs are validated against the curated 33-entry list in
 *   `lib/todays-verse.ts`. Arbitrary user-supplied refs (which would
 *   poison the user's saved collection with junk) are rejected.
 * - All queries scoped to the SSR-authenticated user id — never client-
 *   supplied.
 */

export type SavedVerse = {
  ref: string;
  text: string;
  savedAtIso: string;
};

export type SaveResult =
  | { ok: true }
  | { ok: false; reason: "anonymous" | "unknown_verse" | "pending_setup" | "error" };

const PG_UNDEFINED_TABLE = "42P01"; // Supabase relation does not exist

export async function saveVerse(ref: string): Promise<SaveResult> {
  try {
    if (!ref || typeof ref !== "string") return { ok: false, reason: "error" };

    const curated = getVerseByRef(ref);
    if (!curated) return { ok: false, reason: "unknown_verse" };

    const supa = await createClient();
    const {
      data: { user },
    } = await supa.auth.getUser();
    if (!user) return { ok: false, reason: "anonymous" };

    const svc = createServiceClient();
    const { error } = await svc
      .from("saved_verses")
      .upsert(
        {
          user_id: user.id,
          verse_ref: curated.ref,
          verse_text: curated.text,
        },
        { onConflict: "user_id,verse_ref", ignoreDuplicates: true },
      );

    if (error) {
      if (error.code === PG_UNDEFINED_TABLE) {
        return { ok: false, reason: "pending_setup" };
      }
      return { ok: false, reason: "error" };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function unsaveVerse(ref: string): Promise<SaveResult> {
  try {
    if (!ref || typeof ref !== "string") return { ok: false, reason: "error" };

    const curated = getVerseByRef(ref);
    if (!curated) return { ok: false, reason: "unknown_verse" };

    const supa = await createClient();
    const {
      data: { user },
    } = await supa.auth.getUser();
    if (!user) return { ok: false, reason: "anonymous" };

    const svc = createServiceClient();
    const { error } = await svc
      .from("saved_verses")
      .delete()
      .eq("user_id", user.id)
      .eq("verse_ref", curated.ref);

    if (error) {
      if (error.code === PG_UNDEFINED_TABLE) {
        return { ok: false, reason: "pending_setup" };
      }
      return { ok: false, reason: "error" };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function listSavedVerses(): Promise<SavedVerse[]> {
  try {
    const supa = await createClient();
    const {
      data: { user },
    } = await supa.auth.getUser();
    if (!user) return [];

    const svc = createServiceClient();
    const { data, error } = await svc
      .from("saved_verses")
      .select("verse_ref, verse_text, saved_at")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false })
      .limit(200);

    if (error || !data) return [];

    return data.map((r) => ({
      ref: (r as { verse_ref: string }).verse_ref,
      text: (r as { verse_text: string }).verse_text,
      savedAtIso: (r as { saved_at: string }).saved_at,
    }));
  } catch {
    return [];
  }
}
