import { afterEach, beforeEach, describe, expect, it } from "vitest";

/**
 * Tests for lib/session-cookie.ts — the HMAC-signed `findgod_session_id`
 * helpers. Covers:
 *   - Wire format `{uuid}.{kid}.{mac}` shape
 *   - Round-trip sign → verify
 *   - Cross-kid verify after rotation
 *   - Legacy 2-segment cookie fallback
 *   - Forged-cookie rejection (bad kid, bad mac, length mismatch)
 *   - Anti-confusion: legacy MAC repackaged as 3-segment must fail
 *   - 4+ segment / empty / null inputs
 *   - Dev passthrough (no secrets configured)
 *
 * Each test re-isolates env so changes don't bleed between cases.
 */

const KEY1 = "a".repeat(48); // 48 chars = comfortably above 32 min
const KEY2 = "b".repeat(48);

const originalEnv = {
  NODE_ENV: process.env.NODE_ENV,
  FINDGOD_COOKIE_SECRET: process.env.FINDGOD_COOKIE_SECRET,
  FINDGOD_COOKIE_SECRET_2: process.env.FINDGOD_COOKIE_SECRET_2,
  FINDGOD_COOKIE_KID_ACTIVE: process.env.FINDGOD_COOKIE_KID_ACTIVE,
};

function setEnv(env: {
  NODE_ENV?: string;
  FINDGOD_COOKIE_SECRET?: string | undefined;
  FINDGOD_COOKIE_SECRET_2?: string | undefined;
  FINDGOD_COOKIE_KID_ACTIVE?: string | undefined;
}) {
  if ("NODE_ENV" in env) process.env.NODE_ENV = env.NODE_ENV;
  if ("FINDGOD_COOKIE_SECRET" in env) {
    if (env.FINDGOD_COOKIE_SECRET === undefined)
      delete process.env.FINDGOD_COOKIE_SECRET;
    else process.env.FINDGOD_COOKIE_SECRET = env.FINDGOD_COOKIE_SECRET;
  }
  if ("FINDGOD_COOKIE_SECRET_2" in env) {
    if (env.FINDGOD_COOKIE_SECRET_2 === undefined)
      delete process.env.FINDGOD_COOKIE_SECRET_2;
    else process.env.FINDGOD_COOKIE_SECRET_2 = env.FINDGOD_COOKIE_SECRET_2;
  }
  if ("FINDGOD_COOKIE_KID_ACTIVE" in env) {
    if (env.FINDGOD_COOKIE_KID_ACTIVE === undefined)
      delete process.env.FINDGOD_COOKIE_KID_ACTIVE;
    else process.env.FINDGOD_COOKIE_KID_ACTIVE = env.FINDGOD_COOKIE_KID_ACTIVE;
  }
}

beforeEach(() => {
  // Fresh environment per test. Tests opt in to whatever they need.
  delete process.env.FINDGOD_COOKIE_SECRET;
  delete process.env.FINDGOD_COOKIE_SECRET_2;
  delete process.env.FINDGOD_COOKIE_KID_ACTIVE;
  process.env.NODE_ENV = "test";
});

afterEach(() => {
  // Restore env so the runner doesn't see drift.
  process.env.NODE_ENV = originalEnv.NODE_ENV;
  if (originalEnv.FINDGOD_COOKIE_SECRET === undefined)
    delete process.env.FINDGOD_COOKIE_SECRET;
  else process.env.FINDGOD_COOKIE_SECRET = originalEnv.FINDGOD_COOKIE_SECRET;
  if (originalEnv.FINDGOD_COOKIE_SECRET_2 === undefined)
    delete process.env.FINDGOD_COOKIE_SECRET_2;
  else
    process.env.FINDGOD_COOKIE_SECRET_2 = originalEnv.FINDGOD_COOKIE_SECRET_2;
  if (originalEnv.FINDGOD_COOKIE_KID_ACTIVE === undefined)
    delete process.env.FINDGOD_COOKIE_KID_ACTIVE;
  else
    process.env.FINDGOD_COOKIE_KID_ACTIVE = originalEnv.FINDGOD_COOKIE_KID_ACTIVE;
});

describe("session-cookie / dev passthrough", () => {
  it("accepts a bare UUID when no secrets are configured", async () => {
    setEnv({ NODE_ENV: "development" });
    const { verifySessionId } = await import("@/lib/session-cookie");
    const uuid = "11111111-2222-3333-4444-555555555555";
    expect(verifySessionId(uuid)).toBe(uuid);
  });

  it("rejects malformed inputs even in dev", async () => {
    setEnv({ NODE_ENV: "development" });
    const { verifySessionId } = await import("@/lib/session-cookie");
    expect(verifySessionId("not-a-uuid")).toBeNull();
    expect(verifySessionId(null)).toBeNull();
    expect(verifySessionId("")).toBeNull();
  });

  it("signs as bare UUID when no secrets configured (dev)", async () => {
    setEnv({ NODE_ENV: "development" });
    const { signSessionId } = await import("@/lib/session-cookie");
    const uuid = "11111111-2222-3333-4444-555555555555";
    expect(signSessionId(uuid)).toBe(uuid);
  });
});

describe("session-cookie / kid 1 (pre-rotation)", () => {
  it("signs in {uuid}.{kid}.{mac} shape", async () => {
    setEnv({
      NODE_ENV: "test",
      FINDGOD_COOKIE_SECRET: KEY1,
    });
    const { signSessionId } = await import("@/lib/session-cookie");
    const uuid = "11111111-2222-3333-4444-555555555555";
    const signed = signSessionId(uuid);
    const parts = signed.split(".");
    expect(parts.length).toBe(3);
    expect(parts[0]).toBe(uuid);
    expect(parts[1]).toBe("1");
    expect(parts[2].length).toBeGreaterThan(0);
  });

  it("round-trips: sign → verify returns the same UUID", async () => {
    setEnv({ NODE_ENV: "test", FINDGOD_COOKIE_SECRET: KEY1 });
    const { signSessionId, verifySessionId } = await import(
      "@/lib/session-cookie"
    );
    const uuid = "11111111-2222-3333-4444-555555555555";
    const signed = signSessionId(uuid);
    expect(verifySessionId(signed)).toBe(uuid);
  });

  it("verifies a legacy 2-segment cookie against kid 1", async () => {
    // Build a legacy-format cookie by hand: {uuid}.{base64url(hmac-sha256(uuid))}
    setEnv({ NODE_ENV: "test", FINDGOD_COOKIE_SECRET: KEY1 });
    const { createHmac } = await import("node:crypto");
    const uuid = "11111111-2222-3333-4444-555555555555";
    const mac = createHmac("sha256", KEY1).update(uuid).digest("base64url");
    const legacyCookie = `${uuid}.${mac}`;

    const { verifySessionId } = await import("@/lib/session-cookie");
    expect(verifySessionId(legacyCookie)).toBe(uuid);
  });
});

describe("session-cookie / rotation in progress (kid 2 active, both secrets)", () => {
  it("signs new cookies with kid 2", async () => {
    setEnv({
      NODE_ENV: "test",
      FINDGOD_COOKIE_SECRET: KEY1,
      FINDGOD_COOKIE_SECRET_2: KEY2,
      FINDGOD_COOKIE_KID_ACTIVE: "2",
    });
    const { signSessionId } = await import("@/lib/session-cookie");
    const signed = signSessionId("11111111-2222-3333-4444-555555555555");
    expect(signed.split(".")[1]).toBe("2");
  });

  it("verifies kid-1 cookies even when kid 2 is active", async () => {
    // Sign with kid 1 active...
    setEnv({ NODE_ENV: "test", FINDGOD_COOKIE_SECRET: KEY1 });
    const mod1 = await import("@/lib/session-cookie");
    const signed = mod1.signSessionId(
      "11111111-2222-3333-4444-555555555555",
    );

    // ...then flip active kid to 2 (with both secrets) and verify.
    setEnv({
      NODE_ENV: "test",
      FINDGOD_COOKIE_SECRET: KEY1,
      FINDGOD_COOKIE_SECRET_2: KEY2,
      FINDGOD_COOKIE_KID_ACTIVE: "2",
    });
    // Re-import to pick up env changes (in case anything caches at module
    // scope). vitest's module isolation makes this a no-op when the
    // helper has no module-scoped state, but the explicit re-import is
    // defensive against future caching.
    const mod2 = await import("@/lib/session-cookie");
    expect(mod2.verifySessionId(signed)).toBe(
      "11111111-2222-3333-4444-555555555555",
    );
  });
});

describe("session-cookie / forged + malformed inputs", () => {
  it("rejects an invalid kid in 3-segment form", async () => {
    setEnv({ NODE_ENV: "test", FINDGOD_COOKIE_SECRET: KEY1 });
    const { verifySessionId } = await import("@/lib/session-cookie");
    expect(
      verifySessionId(
        "11111111-2222-3333-4444-555555555555.999.AAAAAAAAAAAA",
      ),
    ).toBeNull();
  });

  it("rejects a wrong MAC", async () => {
    setEnv({ NODE_ENV: "test", FINDGOD_COOKIE_SECRET: KEY1 });
    const { verifySessionId } = await import("@/lib/session-cookie");
    // 44-char fake mac (length-matched to a real base64url SHA-256)
    expect(
      verifySessionId(
        "11111111-2222-3333-4444-555555555555.1." +
          "x".repeat(43),
      ),
    ).toBeNull();
  });

  it("rejects a length-mismatched MAC without throwing", async () => {
    setEnv({ NODE_ENV: "test", FINDGOD_COOKIE_SECRET: KEY1 });
    const { verifySessionId } = await import("@/lib/session-cookie");
    expect(() =>
      verifySessionId(
        "11111111-2222-3333-4444-555555555555.1.short",
      ),
    ).not.toThrow();
    expect(
      verifySessionId(
        "11111111-2222-3333-4444-555555555555.1.short",
      ),
    ).toBeNull();
  });

  it("rejects 4+ segments", async () => {
    setEnv({ NODE_ENV: "test", FINDGOD_COOKIE_SECRET: KEY1 });
    const { verifySessionId } = await import("@/lib/session-cookie");
    expect(verifySessionId("a.b.c.d")).toBeNull();
  });

  it("rejects null and empty input", async () => {
    setEnv({ NODE_ENV: "test", FINDGOD_COOKIE_SECRET: KEY1 });
    const { verifySessionId } = await import("@/lib/session-cookie");
    expect(verifySessionId(null)).toBeNull();
    expect(verifySessionId("")).toBeNull();
  });

  it("anti-confusion: a legacy 2-segment MAC cannot be repackaged as kid-1 3-segment", async () => {
    // Build a legacy 2-segment cookie (HMAC over bare uuid).
    setEnv({ NODE_ENV: "test", FINDGOD_COOKIE_SECRET: KEY1 });
    const { createHmac } = await import("node:crypto");
    const uuid = "11111111-2222-3333-4444-555555555555";
    const legacyMac = createHmac("sha256", KEY1).update(uuid).digest("base64url");

    // Try to re-present it as a 3-segment kid-1 cookie. The kid-1
    // 3-segment HMAC input is `${uuid}|1`, NOT bare uuid. So the legacy
    // mac should NOT verify under the 3-segment branch.
    const { verifySessionId } = await import("@/lib/session-cookie");
    const repackaged = `${uuid}.1.${legacyMac}`;
    expect(verifySessionId(repackaged)).toBeNull();
  });
});

describe("session-cookie / newSessionId", () => {
  it("returns a UUID + signed value that round-trips", async () => {
    setEnv({ NODE_ENV: "test", FINDGOD_COOKIE_SECRET: KEY1 });
    const { newSessionId, verifySessionId } = await import(
      "@/lib/session-cookie"
    );
    const { sessionId, signed } = newSessionId();
    expect(sessionId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(verifySessionId(signed)).toBe(sessionId);
  });
});
