import { randomUUID } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Records a `landed` funnel event — fired once per session by a small
 * client-side tracker on the homepage. If the visitor already has a
 * `findgod_session_id` cookie, we skip (they've landed before). First-time
 * visitors get a session cookie set in the response.
 *
 * Kept deliberately minimal: no body, no auth. The only caller is our own
 * homepage. If a spammer hits it, they can inflate `landed` counts at
 * worst — they can't spoof the other three funnel events (those fire
 * server-side from trusted code paths).
 */
const SESSION_COOKIE = "findgod_session_id";
const SESSION_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

export async function POST(req: Request): Promise<Response> {
  const cookie = req.headers.get("cookie") ?? "";
  const existing = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));

  if (existing) {
    // Already seen this visitor. No event, no cookie change.
    return new Response(null, { status: 204 });
  }

  const sessionId = randomUUID();

  const supabase = createServiceClient();
  const { error } = await supabase.from("events").insert({
    event_type: "landed",
    session_id: sessionId,
  });
  if (error) {
    console.error("[findgod/track/landed] insert failed:", error.message);
    // Still set the cookie so we don't retry on every navigation.
  }

  const res = new Response(null, { status: 204 });
  res.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${sessionId}; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax; Secure`,
  );
  return res;
}
