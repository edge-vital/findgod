"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Server actions for the authenticated-user conversation history drawer.
 *
 * All queries are scoped by the currently-authenticated user's id —
 * never by a client-supplied parameter. The `messages` table has RLS
 * enabled with no policies (service-role only), so we use the service
 * client AFTER establishing the user identity from the SSR session.
 *
 * Returns empty arrays on any error or anonymous session — fails-open
 * so the drawer never blocks the chat UI.
 */

export type ConversationSummary = {
  conversationId: string;
  firstQuestion: string;
  lastActivityIso: string;
  turnCount: number;
};

export type LoadedMessage = {
  id: string;
  role: "user" | "assistant";
  parts: Array<{ type: "text"; text: string }>;
};

/**
 * Count of distinct UTC days the authenticated user has sent or received
 * a chat message. Used by the gentle-streak chip in the top bar.
 *
 * Fails-open to 0 on any error or anonymous session.
 *
 * Computed in JS rather than a DB GROUP BY because PostgREST doesn't
 * directly expose date_trunc grouping without an RPC. At V1 (single
 * active admin, low traffic) the 500-row cap is plenty.
 */
export async function getStreakDays(): Promise<number> {
  try {
    const supa = await createClient();
    const {
      data: { user },
    } = await supa.auth.getUser();
    if (!user) return 0;

    const svc = createServiceClient();
    const { data, error } = await svc
      .from("messages")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error || !data) return 0;

    const days = new Set<string>();
    for (const row of data) {
      const at = (row as { created_at: string }).created_at;
      // UTC day key — YYYY-MM-DD from the ISO timestamp
      days.add(at.slice(0, 10));
    }
    return days.size;
  } catch {
    return 0;
  }
}

/**
 * List the authenticated user's recent conversations, newest-first.
 * Caps at the last 500 messages → ~50 distinct conversations. Beyond
 * that, older conversations silently age out of the drawer (V1
 * acceptable; admin list-scan ceilings are tracked separately).
 */
export async function listConversations(): Promise<ConversationSummary[]> {
  try {
    const supa = await createClient();
    const {
      data: { user },
    } = await supa.auth.getUser();
    if (!user) return [];

    const svc = createServiceClient();
    const { data, error } = await svc
      .from("messages")
      .select("conversation_id, role, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error || !data) return [];

    type Row = {
      conversation_id: string;
      role: string;
      content: string;
      created_at: string;
    };

    const byId = new Map<
      string,
      {
        rows: Row[];
        lastAt: string;
      }
    >();

    for (const row of data as Row[]) {
      const existing = byId.get(row.conversation_id);
      if (existing) {
        existing.rows.push(row);
        if (row.created_at > existing.lastAt) existing.lastAt = row.created_at;
      } else {
        byId.set(row.conversation_id, {
          rows: [row],
          lastAt: row.created_at,
        });
      }
    }

    const summaries: ConversationSummary[] = [];
    for (const [conversationId, group] of byId) {
      // First user message (chronologically earliest user row in this group)
      const userRows = group.rows
        .filter((r) => r.role === "user")
        .sort((a, b) => a.created_at.localeCompare(b.created_at));
      const firstUser = userRows[0];
      if (!firstUser) continue; // skip conversations that have no user message
      summaries.push({
        conversationId,
        firstQuestion: firstUser.content.slice(0, 140),
        lastActivityIso: group.lastAt,
        turnCount: group.rows.length,
      });
    }

    summaries.sort((a, b) =>
      b.lastActivityIso.localeCompare(a.lastActivityIso),
    );

    return summaries.slice(0, 50);
  } catch {
    return [];
  }
}

/**
 * Load the full message thread for one of the authenticated user's
 * conversations. Auth-scoped: even if a client passes a foreign
 * conversation_id, the query's user_id filter ensures no foreign data
 * is returned (empty array instead).
 */
export async function loadConversation(
  conversationId: string,
): Promise<LoadedMessage[]> {
  try {
    if (!conversationId || typeof conversationId !== "string") return [];
    // Basic shape guard — UUID-ish only. Stops obviously-malformed input
    // from hitting the DB.
    if (conversationId.length > 64) return [];

    const supa = await createClient();
    const {
      data: { user },
    } = await supa.auth.getUser();
    if (!user) return [];

    const svc = createServiceClient();
    const { data, error } = await svc
      .from("messages")
      .select("id, role, content, created_at")
      .eq("user_id", user.id)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(200);

    if (error || !data) return [];

    const out: LoadedMessage[] = [];
    for (const r of data) {
      if (r.role !== "user" && r.role !== "assistant") continue;
      out.push({
        id: r.id as string,
        role: r.role as "user" | "assistant",
        parts: [{ type: "text", text: r.content as string }],
      });
    }
    return out;
  } catch {
    return [];
  }
}
