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
 * Cookie format on the wire:  `{uuid}.{kid}.{base64url(hmac)}`
 *
 *   - {uuid} — the bare UUID v4 we generate
 *   - {kid}  — single-character key id ("1" by default; bumped on rotation)
 *   - {hmac} — base64url HMAC-SHA256 over `{uuid}|{kid}` using the
 *              secret matching that kid
 *
 * Rotation: set `FINDGOD_COOKIE_SECRET_2` in Vercel env, set
 * `FINDGOD_COOKIE_KID_ACTIVE=2`. New cookies are signed with kid=2.
 * Old cookies (kid=1) still verify against `FINDGOD_COOKIE_SECRET`
 * during the rollover window. After 30–90 days, drop the old secret.
 *
 * Production requires the active secret to be 32+ chars; dev silently
 * disables signing so `npm run dev` works without env setup.
 *
 * Backwards compat: an unsigned UUID (pre-rotation legacy cookie) is
 * REJECTED on read so the route mints a fresh signed cookie. Existing
 * anonymous visitors lose session continuity on the first visit after
 * deploy. The security risk of accepting forgeable session IDs
 * outweighs the UX cost.
 */

const SECRET_MIN_LEN = 32;

type KeyId = "1" | "2";

/**
 * Resolve a secret for a given kid. Falls through env vars:
 *   kid "1" → FINDGOD_COOKIE_SECRET
 *   kid "2" → FINDGOD_COOKIE_SECRET_2
 */
function getSecretForKid(kid: KeyId): string | null {
  const envName =
    kid === "1" ? "FINDGOD_COOKIE_SECRET" : "FINDGOD_COOKIE_SECRET_2";
  const secret = process.env[envName];
  if (!secret || secret.length < SECRET_MIN_LEN) return null;
  return secret;
}

/**
 * Resolve the CURRENT active kid for new signatures. Defaults to "1"
 * if FINDGOD_COOKIE_KID_ACTIVE is unset. During rotation the operator
 * sets this to "2" while keeping FINDGOD_COOKIE_SECRET (kid 1) alive
 * so older cookies still verify.
 */
function activeKid(): KeyId {
  const v = process.env.FINDGOD_COOKIE_KID_ACTIVE;
  return v === "2" ? "2" : "1";
}

/**
 * In dev with no secret, sign+verify pass through unsigned. In
 * production the absence of EVERY secret throws (catastrophic config).
 */
function inDevWithoutSecret(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return getSecretForKid("1") === null && getSecretForKid("2") === null;
}

function ensureProductionConfigured(): void {
  if (process.env.NODE_ENV !== "production") return;
  const k = activeKid();
  if (getSecretForKid(k) === null) {
    throw new Error(
      `FINDGOD_COOKIE_SECRET (kid=${k}) is missing or too short in production. ` +
        "Set it in Vercel project settings (32+ random bytes).",
    );
  }
}

function isUuidShape(value: string): boolean {
  return /^[0-9a-f-]{36}$/i.test(value);
}

function macFor(uuid: string, kid: KeyId, secret: string): string {
  return createHmac("sha256", secret)
    .update(`${uuid}|${kid}`)
    .digest("base64url");
}

export function signSessionId(sessionId: string): string {
  if (inDevWithoutSecret()) return sessionId;
  ensureProductionConfigured();
  const kid = activeKid();
  const secret = getSecretForKid(kid);
  if (!secret) {
    // Dev with one secret missing — fall back to the other.
    const alt: KeyId = kid === "1" ? "2" : "1";
    const altSecret = getSecretForKid(alt);
    if (!altSecret) return sessionId;
    return `${sessionId}.${alt}.${macFor(sessionId, alt, altSecret)}`;
  }
  return `${sessionId}.${kid}.${macFor(sessionId, kid, secret)}`;
}

/**
 * Verify a (potentially) signed session-id cookie. Returns the UUID on
 * success, `null` on missing/malformed/forged.
 *
 * Format expected: `{uuid}.{kid}.{hmac}`. We try the kid in the cookie
 * first (so a kid=1 cookie verifies against secret 1 even after the
 * active kid has rolled to 2). A legacy 2-segment cookie
 * (`{uuid}.{hmac}`) is accepted ONLY against the kid-1 secret to ease
 * the first deploy after this helper lands; subsequent rotations must
 * use the 3-segment shape.
 *
 * In dev with NO secrets configured, accept a plain UUID as a
 * passthrough so local work doesn't require the secret.
 */
export function verifySessionId(raw: string | null): string | null {
  if (!raw) return null;

  if (inDevWithoutSecret()) {
    return isUuidShape(raw) ? raw : null;
  }

  const parts = raw.split(".");

  // 3-segment form: {uuid}.{kid}.{hmac}
  if (parts.length === 3) {
    const [uuid, kidRaw, mac] = parts;
    if (!isUuidShape(uuid)) return null;
    if (kidRaw !== "1" && kidRaw !== "2") return null;
    const secret = getSecretForKid(kidRaw);
    if (!secret) return null;
    const expected = macFor(uuid, kidRaw, secret);
    const a = Buffer.from(mac);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
    return uuid;
  }

  // Legacy 2-segment form: {uuid}.{hmac} — only accepted against kid 1.
  // Pre-rotation cookies signed before this helper grew kid support.
  if (parts.length === 2) {
    const [uuid, mac] = parts;
    if (!isUuidShape(uuid)) return null;
    const secret = getSecretForKid("1");
    if (!secret) return null;
    const legacyMac = createHmac("sha256", secret).update(uuid).digest("base64url");
    const a = Buffer.from(mac);
    const b = Buffer.from(legacyMac);
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
    return uuid;
  }

  return null;
}

/**
 * Mint a fresh session id. Returns `{sessionId, signed}` so the caller
 * can both use the bare id and write the signed cookie value.
 */
export function newSessionId(): { sessionId: string; signed: string } {
  const sessionId = randomUUID();
  return { sessionId, signed: signSessionId(sessionId) };
}
