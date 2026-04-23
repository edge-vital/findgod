import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.FINDGOD_COOKIE_SECRET = "a".repeat(48);
});

// Imported AFTER the secret is set so `getSecret()` reads the configured value
// on first call. Chat-limit has no module-level cache tied to the env var, but
// this ordering keeps the intent explicit.
import {
  buildSetCookies,
  COOKIE_NAME,
  readChatState,
} from "@/lib/chat-limit";

function toHeaderValue(cookie: string): string {
  return cookie.split(";")[0];
}

describe("chat-limit HMAC", () => {
  it("rejects a cookie whose payload has been tampered with", () => {
    const cookies = buildSetCookies(1, 4);
    expect(cookies).not.toBeNull();

    const signedCookie = toHeaderValue(cookies![0]);
    const [name, rawValue] = signedCookie.split("=");
    expect(name).toBe(COOKIE_NAME);

    // Sanity: the untouched cookie verifies cleanly.
    const validReq = new Request("https://findgod.com", {
      headers: { cookie: `${name}=${rawValue}` },
    });
    expect(readChatState(validReq)).toEqual({ count: 1, limit: 4 });

    // Tamper: swap the count from "1" to "999" while leaving the HMAC alone.
    const decoded = decodeURIComponent(rawValue);
    const mac = decoded.slice(decoded.lastIndexOf(".") + 1);
    const tamperedSigned = `999:4.${mac}`;
    const tamperedReq = new Request("https://findgod.com", {
      headers: { cookie: `${name}=${encodeURIComponent(tamperedSigned)}` },
    });

    expect(readChatState(tamperedReq)).toBeNull();
  });
});
