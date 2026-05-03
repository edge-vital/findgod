import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

/**
 * Signed session-id cookie helpers.
 *
 * `findgod_session_id` groups anonymous chat history into a single thread
 * for the admin dashboard AND is the join key for backfilling messages
 * onto a user account at OTP-verify time. Originally unsigned — which let
 * an attacker hand-set the cookie before signup and claim a victim's
 * anonymous chat history into their own account.
 *
 * These helpers wrap the same FINDGOD_COOKIE_SECRET used by chat-limit.ts.
 * Production requires the secret to be 32+ chars; dev silently disables
 * signing so `npm run dev` works without env setup. When signing is off,
 * cookies are written and accepted as plain UUIDs (parity with the
 * pre-signing behavior — fine for dev).
 *
 * Cookie format on the wire (signed): `{uuid}.{base64url(hmac)}`
 *
 * Backwards compat: an unsigned UUID (legacy cookie from before this
 * helper landed) is REJECTED on read so the route mints a fresh signed
 * cookie. Existing anonymous visitors lose session continuity on the
 * first visit after deploy. This is intentional — the security risk of
 * accepting forgeable session IDs outweighs the UX cost.
 */

const SECRET_MIN_LEN = 32;

function getSecret(): string | null {
  const secret = process.env.FINDGOD_COOKIE_SECRET;
  if (!secret || secret.length < SECRET_MIN_LEN) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FINDGOD_COOKIE_SECRET is missing or too short in production. " +
          "Set it in Vercel project settings (32+ random bytes).",
      );
    }
    return null;
  }
  return secret;
}

function isUuidShape(value: string): boolean {
  return /^[0-9a-f-]{36}$/i.test(value);
}

export function signSessionId(sessionId: string): string {
  const secret = getSecret();
  if (!secret) return sessionId; // dev: unsigned passthrough
  const mac = createHmac("sha256", secret).update(sessionId).digest("base64url");
  return `${sessionId}.${mac}`;
}

/**
 * Verify a (potentially) signed session-id cookie. Returns the UUID on
 * success, `null` on missing/malformed/forged.
 *
 * In dev (no secret), accept a plain UUID as a passthrough so local work
 * doesn't require the secret. In production an unsigned cookie is
 * REJECTED — the caller mints a fresh signed cookie.
 */
export function verifySessionId(raw: string | null): string | null {
  if (!raw) return null;
  const secret = getSecret();
  if (!secret) {
    return isUuidShape(raw) ? raw : null;
  }
  const lastDot = raw.lastIndexOf(".");
  if (lastDot <= 0) return null; // no signature → reject in prod
  const value = raw.slice(0, lastDot);
  const mac = raw.slice(lastDot + 1);
  if (!isUuidShape(value)) return null;
  const expected = createHmac("sha256", secret)
    .update(value)
    .digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  return value;
}

/**
 * Mint a fresh session id. Returns `{sessionId, signed}` so the caller
 * can both use the bare id and write the signed cookie value.
 */
export function newSessionId(): { sessionId: string; signed: string } {
  const sessionId = randomUUID();
  return { sessionId, signed: signSessionId(sessionId) };
}
