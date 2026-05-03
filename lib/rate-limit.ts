import "server-only";
import { createServiceClient } from "./supabase/service";

/**
 * Application-level rate-limit helpers.
 *
 * Backed by `public.auth_rate_limits` (migration 20260503000001).
 * BotID protects against scripted bots; this protects against passing-
 * BotID brute-force (especially OTP guessing) AND against multi-account
 * abuse where a per-IP cap is the right tool.
 *
 * **Fails open.** If Supabase is unreachable the helper returns `allowed:
 * true` rather than locking real users out on infra hiccups. The threat
 * model: a transient outage can let an attacker burst, but the floor for
 * the threat we're defending against (OTP brute force) is much higher
 * than the rare outage window. BotID still gates.
 *
 * Window semantics: rolling, anchored at `now() - windowMs`. The count
 * query is a Supabase HEAD-only count so we don't read row data.
 */

export type AttemptType =
  | "otp_request"
  | "otp_verify"
  | "examples_save";

export type RateLimitConfig = {
  /** Opaque bucket — caller chooses namespace, e.g. `email:foo@bar.com`. */
  key: string;
  type: AttemptType;
  /** Reject when prior count in the window is >= this. */
  max: number;
  /** Rolling window in ms. */
  windowMs: number;
};

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

/**
 * Check a bucket's recent attempt count. Does NOT record the attempt —
 * the caller pairs this with `recordAttempt()` once they've decided to
 * proceed (so a rejection doesn't burn a slot).
 */
export async function checkRateLimit(
  cfg: RateLimitConfig,
): Promise<RateLimitResult> {
  const since = new Date(Date.now() - cfg.windowMs).toISOString();
  try {
    const { count, error } = await createServiceClient()
      .from("auth_rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("bucket_key", cfg.key)
      .eq("attempt_type", cfg.type)
      .gte("created_at", since);

    if (error) {
      console.error(
        "[findgod/rate-limit] count failed (fail-open):",
        error.code ?? "unknown",
      );
      return { allowed: true };
    }

    if (typeof count === "number" && count >= cfg.max) {
      return {
        allowed: false,
        retryAfterSec: Math.ceil(cfg.windowMs / 1000),
      };
    }
    return { allowed: true };
  } catch (e) {
    console.error(
      "[findgod/rate-limit] threw (fail-open):",
      e instanceof Error ? e.name : "unknown",
    );
    return { allowed: true };
  }
}

/**
 * Record an attempt. Fire-and-forget — the caller awaits at most a
 * single trip; a record failure must never block the user.
 */
export async function recordAttempt(
  key: string,
  type: AttemptType,
): Promise<void> {
  try {
    const { error } = await createServiceClient()
      .from("auth_rate_limits")
      .insert({ bucket_key: key, attempt_type: type });
    if (error) {
      console.error(
        "[findgod/rate-limit] insert failed:",
        error.code ?? "unknown",
      );
    }
  } catch (e) {
    console.error(
      "[findgod/rate-limit] insert threw:",
      e instanceof Error ? e.name : "unknown",
    );
  }
}

/**
 * Best-effort client IP extraction for rate-limit bucketing. Vercel
 * sets `x-vercel-forwarded-for`; a generic `x-forwarded-for` header is
 * fallback. Returns `unknown` when no header is present (dev/test) so
 * the bucket still groups but doesn't blow up.
 */
export function clientIpFromHeaders(headers: Headers): string {
  const vercel = headers.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0].trim();
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
