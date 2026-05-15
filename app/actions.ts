"use server";

import { checkBotId } from "botid/server";
import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  checkRateLimit,
  clientIpFromHeaders,
  recordAttempt,
} from "@/lib/rate-limit";
import { verifySessionId } from "@/lib/session-cookie";

const SESSION_COOKIE = "findgod_session_id";

/**
 * Two-step email OTP flow:
 *   Step 1 (requestOtp) — user submits name + email → Supabase sends 6-digit code.
 *   Step 2 (verifyOtp)  — user submits code → Supabase creates session + we
 *                          mirror them into Beehiiv for the Daily Word list.
 *
 * State flows through useActionState on the client. The `step` field is the
 * discriminant — the UI renders form/code/success based on it.
 */

export type AuthState =
  | { step: "idle" }
  | { step: "code"; name: string; email: string }
  | { step: "success"; firstName: string }
  | {
      step: "error";
      message: string;
      prevStep: "idle" | "code";
      email?: string;
      name?: string;
      phone?: string;
    };

const NAME_MAX = 80;
const EMAIL_MAX = 254;
const PHONE_MAX = 20;
const EMAIL_PATTERN = /^[^\s@.][^\s@]*@[^\s@.][^\s@]*\.[^\s@]{2,}$/;

// Rate-limit windows for OTP. BotID handles scripted bots; these caps
// stop a passing-BotID actor (e.g. residential-proxy worker) from brute-
// forcing 6-digit codes against the same email. Numbers err generous so
// a real user with a typo'd code on a flaky email isn't blocked.
const OTP_REQUEST_PER_EMAIL_MAX = 5;
const OTP_REQUEST_PER_EMAIL_WINDOW_MS = 60 * 60 * 1000; // 1h
const OTP_REQUEST_PER_IP_MAX = 20;
const OTP_REQUEST_PER_IP_WINDOW_MS = 60 * 60 * 1000; // 1h
const OTP_VERIFY_PER_EMAIL_MAX = 8;
const OTP_VERIFY_PER_EMAIL_WINDOW_MS = 10 * 60 * 1000; // 10m

function cleanName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw
    .trim()
    .replace(/[\x00-\x1f\x7f]/g, "")
    .slice(0, NAME_MAX);
  return name || null;
}

function cleanEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim();
  if (!email || email.length > EMAIL_MAX) return null;
  if (!EMAIL_PATTERN.test(email)) return null;
  return email;
}

/**
 * Normalize a user-entered phone number to E.164 (`+1XXXXXXXXXX`).
 *
 * Phone is OPTIONAL on the signup form. This function returns:
 *   - `null` if the raw value is missing/empty (caller treats as "skipped")
 *   - `false` if the raw value is present but invalid (caller surfaces error)
 *   - a normalized E.164 string on success
 *
 * V1 supports US numbers only (10 digits, or 11 with leading 1). Future
 * international support would replace this with libphonenumber-js. Storing
 * everything in E.164 means downstream tools (SMS providers, deduplication)
 * never see "(555) 123-4567" vs "+15551234567" as different numbers.
 */
function cleanPhone(raw: unknown): string | null | false {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null; // genuinely empty == skipped
  if (trimmed.length > PHONE_MAX) return false;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return false;
}

/**
 * Step 1 — request an OTP. Writes first_name into Supabase user_metadata
 * on user creation so we can greet them by name later.
 */
export async function requestOtp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const verification = await checkBotId();
  if (verification.isBot) {
    return {
      step: "error",
      prevStep: "idle",
      message: "Something broke on our end. One more try.",
    };
  }

  const rawName = formData.get("name");
  const rawEmail = formData.get("email");
  const rawPhone = formData.get("phone");
  const rawSmsConsent = formData.get("sms_consent");
  const rawAgeConfirm = formData.get("age_confirm");
  const name = cleanName(rawName);
  const email = cleanEmail(rawEmail);
  const phoneResult = cleanPhone(rawPhone);
  // Checkboxes arrive as the literal "on" when checked, or absent when not.
  const smsConsented = rawSmsConsent === "on";
  const ageConfirmed = rawAgeConfirm === "on";

  const rawNameStr = typeof rawName === "string" ? rawName : undefined;
  const rawEmailStr = typeof rawEmail === "string" ? rawEmail : undefined;
  const rawPhoneStr = typeof rawPhone === "string" ? rawPhone : undefined;

  if (!name) {
    return {
      step: "error",
      prevStep: "idle",
      message: "Name is required.",
      name: rawNameStr,
      email: rawEmailStr,
      phone: rawPhoneStr,
    };
  }
  if (!email) {
    return {
      step: "error",
      prevStep: "idle",
      message: "Please enter a valid email.",
      name,
      email: rawEmailStr,
      phone: rawPhoneStr,
    };
  }

  // Phone is OPTIONAL. If they typed something but it didn't parse → reject.
  // If they typed something valid → enforce TCPA consent + 18+ confirmation.
  if (phoneResult === false) {
    return {
      step: "error",
      prevStep: "idle",
      message: "That phone number doesn't look right. Use a 10-digit US number.",
      name,
      email,
      phone: rawPhoneStr,
    };
  }
  const phone = phoneResult; // null = skipped, or a normalized E.164 string
  if (phone && !smsConsented) {
    return {
      step: "error",
      prevStep: "idle",
      message:
        "If you share your phone, please tick the box agreeing to receive texts.",
      name,
      email,
      phone: rawPhoneStr,
    };
  }
  if (phone && !ageConfirmed) {
    return {
      step: "error",
      prevStep: "idle",
      message: "Please confirm you're 18 or older to receive texts.",
      name,
      email,
      phone: rawPhoneStr,
    };
  }

  // Rate-limit by email AND by IP. Either bucket exceeded → reject with
  // a generic message that doesn't disclose which bucket fired (avoids
  // helping the attacker pivot).
  const ip = clientIpFromHeaders(await headers());
  const emailKey = `email:${email.toLowerCase()}`;
  const ipKey = `ip:${ip}`;
  const [emailLimit, ipLimit] = await Promise.all([
    checkRateLimit({
      key: emailKey,
      type: "otp_request",
      max: OTP_REQUEST_PER_EMAIL_MAX,
      windowMs: OTP_REQUEST_PER_EMAIL_WINDOW_MS,
    }),
    checkRateLimit({
      key: ipKey,
      type: "otp_request",
      max: OTP_REQUEST_PER_IP_MAX,
      windowMs: OTP_REQUEST_PER_IP_WINDOW_MS,
    }),
  ]);
  if (!emailLimit.allowed || !ipLimit.allowed) {
    return {
      step: "error",
      prevStep: "idle",
      message: "Too many attempts. Take a breath. Try again in an hour.",
      name,
      email,
    };
  }

  // Build the `data` payload Supabase writes to user_metadata. Phone +
  // consent ride here so we have a TCPA-defensible record of when/where
  // the user agreed to receive texts. Statute of limitations is 4 years;
  // keep these fields forever.
  const userMetadata: Record<string, unknown> = { first_name: name };
  if (phone) {
    userMetadata.phone = phone;
    userMetadata.sms_consent = {
      agreed: true,
      agreed_at: new Date().toISOString(),
      ip,
      // Snapshot the consent text shown so future-us can prove what they
      // saw. Edit in lockstep with the signup-form copy.
      text: "By providing my phone number and ticking this box, I agree to receive recurring marketing and transactional text messages from FINDGOD. Consent is not a condition of any purchase. Msg & data rates may apply. Msg frequency varies. Reply STOP to cancel, HELP for help.",
      age_confirmed: true,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      data: userMetadata,
    },
  });

  // Record the attempt AFTER the Supabase call so a failure-to-send
  // doesn't burn the user's quota.
  if (!error) {
    void recordAttempt(emailKey, "otp_request");
    void recordAttempt(ipKey, "otp_request");
  }

  if (error) {
    const summary = `${error.name}: ${error.message}`;
    console.error("[FINDGOD otp] request error:", summary);
    return {
      step: "error",
      prevStep: "idle",
      message: "Couldn't send the code. Try again.",
      name,
      email,
    };
  }

  return { step: "code", name, email };
}

/**
 * Step 2 — verify the 6-digit OTP. On success, Supabase sets the session
 * cookie and we push the new subscriber to Beehiiv (fire-and-forget — a
 * Beehiiv failure must not block the user from entering the product).
 */
export async function verifyOtp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const verification = await checkBotId();
  if (verification.isBot) {
    return {
      step: "error",
      prevStep: "code",
      message: "Something broke on our end. One more try.",
    };
  }

  const rawCode = formData.get("code");
  const rawEmail = formData.get("email");
  const rawName = formData.get("name");
  const email = cleanEmail(rawEmail);
  const name = cleanName(rawName);

  if (!email) {
    return {
      step: "error",
      prevStep: "idle",
      message: "Session expired — please re-enter your details.",
    };
  }

  const code =
    typeof rawCode === "string" ? rawCode.replace(/[\s-]/g, "") : "";
  if (!/^\d{6}$/.test(code)) {
    return {
      step: "error",
      prevStep: "code",
      message: "Code should be 6 digits.",
      email,
      name: name ?? undefined,
    };
  }

  // Brute-force ceiling on verify attempts per email per OTP-window.
  // 6-digit OTP entropy ≈ 1 in 1,000,000 — ~8 attempts/window keeps the
  // odds astronomically low while leaving room for typos.
  const verifyKey = `email:${email.toLowerCase()}`;
  const verifyLimit = await checkRateLimit({
    key: verifyKey,
    type: "otp_verify",
    max: OTP_VERIFY_PER_EMAIL_MAX,
    windowMs: OTP_VERIFY_PER_EMAIL_WINDOW_MS,
  });
  if (!verifyLimit.allowed) {
    return {
      step: "error",
      prevStep: "code",
      message: "Too many attempts. Request a new code.",
      email,
      name: name ?? undefined,
    };
  }
  void recordAttempt(verifyKey, "otp_verify");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "email",
  });

  if (error || !data.user) {
    const summary = error
      ? `${error.name}: ${error.message}`
      : "no user on verifyOtp result";
    console.error("[FINDGOD otp] verify error:", summary);
    return {
      step: "error",
      prevStep: "code",
      message: "That code didn't match. Try again.",
      email,
      name: name ?? undefined,
    };
  }

  const firstName =
    (data.user.user_metadata?.first_name as string | undefined) ??
    name ??
    "";
  // Phone is optional + only present if the user filled the field at
  // requestOtp time. If absent we just skip the Beehiiv custom field.
  const phone =
    (data.user.user_metadata?.phone as string | undefined) ?? undefined;

  // ── Admin dashboard instrumentation ─────────────────────────────────
  // 1. Emit `signed_up` funnel event with this visitor's session id.
  // 2. Backfill user_id onto their previous anonymous messages + events so
  //    their full history attaches to the new account in the admin views.
  // All fire-and-forget; a Supabase hiccup here must not block auth.
  try {
    const cookieStore = await cookies();
    const rawSession = cookieStore.get(SESSION_COOKIE)?.value;
    // Verify the HMAC signature BEFORE backfilling. Pre-fix, an attacker
    // could hand-set this cookie to any UUID before signup and claim that
    // session's anonymous chat history. The signature is the gate.
    const sessionId = verifySessionId(rawSession ?? null);
    if (sessionId) {
      const svc = createServiceClient();
      void svc.from("events").insert({
        event_type: "signed_up",
        session_id: sessionId,
        user_id: data.user.id,
      });
      void svc
        .from("messages")
        .update({ user_id: data.user.id })
        .eq("session_id", sessionId)
        .is("user_id", null);
      void svc
        .from("events")
        .update({ user_id: data.user.id })
        .eq("session_id", sessionId)
        .is("user_id", null);
    }
  } catch (e) {
    console.error(
      "[FINDGOD otp] signed_up event / backfill error:",
      e instanceof Error ? e.message : "unknown",
    );
  }

  // Beehiiv subscribe — TRUE fire-and-forget via Vercel `after()`. The
  // earlier `await fetch(...)` was blocking the auth success path despite
  // a comment claiming otherwise — a Beehiiv outage stalled every signup
  // until function timeout. `after()` lets the action return immediately
  // while the platform keeps the function alive long enough for the
  // background fetch to resolve. We still wrap with a 3s AbortController
  // so a hanging connection can't burn the whole maxDuration window.
  const beehiivKey = process.env.BEEHIIV_API_KEY;
  const beehiivPub = process.env.BEEHIIV_PUBLICATION_ID;
  if (beehiivKey && beehiivPub) {
    // PRE-FLIGHT: the "Phone" custom field MUST exist in the Beehiiv
    // publication's dashboard before we send it. Beehiiv silently drops
    // unknown custom fields, so without the dashboard setup the phone
    // value vanishes on sync. Create it once at: Beehiiv → Settings →
    // Subscribers → Custom Fields → New → name "Phone", type Text.
    const customFields: Array<{ name: string; value: string }> = [];
    if (firstName) customFields.push({ name: "First Name", value: firstName });
    if (phone) customFields.push({ name: "Phone", value: phone });

    after(async () => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 3_000);
      try {
        const response = await fetch(
          `https://api.beehiiv.com/v2/publications/${beehiivPub}/subscriptions`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${beehiivKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              reactivate_existing: false,
              send_welcome_email: true,
              utm_source: "findgod.com",
              utm_medium: "signup_wall",
              custom_fields: customFields.length > 0 ? customFields : undefined,
            }),
            signal: ctrl.signal,
          },
        );
        if (!response.ok) {
          console.error(
            `[FINDGOD beehiiv] forward non-200: ${response.status} ${response.statusText}`,
          );
        }
      } catch (e) {
        // AbortError (timeout), network error, etc. — log only name+message
        // (Beehiiv response bodies sometimes echo input fields).
        const msg = e instanceof Error ? `${e.name}: ${e.message}` : "unknown";
        console.error("[FINDGOD beehiiv] forward error:", msg);
      } finally {
        clearTimeout(timer);
      }
    });
  }

  return { step: "success", firstName };
}
