import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

/**
 * Server-authoritative chat limit via a signed cookie.
 *
 * The cookie carries TWO values: `count:limit`. The limit is chosen
 * randomly (3–5) on the visitor's first chat and locked for the rest of
 * their session so the "cliffhanger" feeling stays consistent across
 * reloads. The count increments by 1 on each accepted message.
 *
 * Why a cookie (not a database): we don't want to stand up a KV/DB just
 * to count messages. An HMAC-signed cookie is tamper-evident — the client
 * can read it but can't forge a different count/limit pair without the
 * secret.
 *
 * Why a companion non-HttpOnly cookie: the UI needs to know the limit to
 * show the signup wall at the right moment. The signed cookie stays
 * HttpOnly (real enforcement); a plain `findgod_chat_meta` cookie carries
 * the same count:limit for the client to read. If someone tampers with
 * the meta cookie, they only hurt their own UX — the server still enforces.
 *
 * Production requires `FINDGOD_COOKIE_SECRET` (32+ random bytes, base64).
 * In dev we silently disable the limit so `npm run dev` works without
 * setup friction — production will fail loudly via `getSecret()`.
 */

// Random range [MIN_LIMIT, MAX_LIMIT] inclusive. Chosen on a visitor's
// first message and stored in the signed cookie for the rest of the session.
export const MIN_LIMIT = 3;
export const MAX_LIMIT = 5;

export const COOKIE_NAME = "findgod_chat_count";
export const META_COOKIE_NAME = "findgod_chat_meta";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

function getSecret(): string | null {
  const secret = process.env.FINDGOD_COOKIE_SECRET;
  if (!secret || secret.length < 32) {
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

function sign(value: string, secret: string): string {
  const mac = createHmac("sha256", secret).update(value).digest("base64url");
  return `${value}.${mac}`;
}

function verify(signed: string, secret: string): string | null {
  const lastDot = signed.lastIndexOf(".");
  if (lastDot <= 0) return null;
  const value = signed.slice(0, lastDot);
  const mac = signed.slice(lastDot + 1);
  const expected = createHmac("sha256", secret)
    .update(value)
    .digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  return value;
}

function parseCountLimit(raw: string): { count: number; limit: number } | null {
  const [countStr, limitStr] = raw.split(":");
  const count = parseInt(countStr, 10);
  const limit = parseInt(limitStr, 10);
  if (!Number.isFinite(count) || count < 0) return null;
  if (!Number.isFinite(limit) || limit < MIN_LIMIT || limit > MAX_LIMIT)
    return null;
  return { count, limit };
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  const match = header
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(name.length + 1));
}

/**
 * Read current chat state from the request's signed cookie. Returns null
 * when the cookie is missing, tampered, or we're in dev without a secret.
 * A null return means the visitor is fresh — call `pickLimit()` to choose
 * one for them on the first message.
 */
export function readChatState(
  req: Request,
): { count: number; limit: number } | null {
  const secret = getSecret();
  if (!secret) return null;
  const signed = readCookie(req.headers.get("cookie"), COOKIE_NAME);
  if (!signed) return null;
  const verified = verify(signed, secret);
  if (!verified) return null;
  return parseCountLimit(verified);
}

/**
 * Pick a random per-session free-message limit. Called once per visitor
 * on their first message, then locked via the cookie.
 */
export function pickLimit(): number {
  // randomInt is inclusive-exclusive on upper bound.
  return randomInt(MIN_LIMIT, MAX_LIMIT + 1);
}

/**
 * Build Set-Cookie headers for the authoritative signed cookie AND the
 * JS-readable meta cookie. Returns null in dev (no secret) so the caller
 * can skip without branching.
 */
export function buildSetCookies(
  count: number,
  limit: number,
): string[] | null {
  const secret = getSecret();
  if (!secret) return null;
  const payload = `${count}:${limit}`;
  const signed = sign(payload, secret);
  const common = `Path=/; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`;
  return [
    // Authoritative — HttpOnly so JS can't touch it.
    `${COOKIE_NAME}=${encodeURIComponent(signed)}; ${common}; HttpOnly`,
    // UX-only mirror — JS reads this to show the signup wall at the right
    // message. Tamper-resistance lives on the signed cookie above.
    `${META_COOKIE_NAME}=${encodeURIComponent(payload)}; ${common}`,
  ];
}

/**
 * True when the limit is actively enforced (i.e. we have a secret).
 * In dev without a secret this is false and the caller should let
 * requests through.
 */
export function isEnforced(): boolean {
  return getSecret() !== null;
}
