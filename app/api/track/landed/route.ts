import { checkBotId } from "botid/server";
import { createServiceClient } from "@/lib/supabase/service";
import { newSessionId, verifySessionId } from "@/lib/session-cookie";

/**
 * Records a `landed` funnel event — fired once per session by a small
 * client-side tracker on the homepage. If the visitor already has a
 * VALID signed `findgod_session_id` cookie, we skip (they've landed
 * before). First-time visitors AND visitors with a missing/forged/
 * legacy-unsigned cookie get a fresh signed session cookie.
 *
 * BotID protection added so the endpoint can't be spammed to inflate
 * `landed` counts and burn Supabase row budget. No-op in local dev;
 * enforced in production. An explicit bot returns 403.
 */
const SESSION_COOKIE = "findgod_session_id";
const SESSION_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

export async function POST(req: Request): Promise<Response> {
  const verification = await checkBotId();
  if (verification.isBot) {
    return new Response(null, { status: 403 });
  }

  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));

  // Only consider the visit "previously landed" if the existing cookie
  // is a VALID signed session id. A missing or forged cookie falls
  // through and gets a fresh one — closes the cookie-forgery path on
  // this endpoint too.
  if (match) {
    const raw = decodeURIComponent(match.slice(SESSION_COOKIE.length + 1));
    if (verifySessionId(raw)) {
      return new Response(null, { status: 204 });
    }
  }

  const { sessionId, signed } = newSessionId();

  const supabase = createServiceClient();
  const { error } = await supabase.from("events").insert({
    event_type: "landed",
    session_id: sessionId,
  });
  if (error) {
    // Log only error.code — PostgREST error.message can include row
    // values on constraint violations.
    console.error(
      "[findgod/track/landed] insert failed:",
      error.code ?? "unknown",
    );
    // Still set the cookie so we don't retry on every navigation.
  }

  const res = new Response(null, { status: 204 });
  res.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(signed)}; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax; Secure; HttpOnly`,
  );
  return res;
}
