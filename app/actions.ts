"use server";

import { checkBotId } from "botid/server";
import { createClient } from "@/lib/supabase/server";

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
  | { step: "error"; message: string; prevStep: "idle" | "code"; email?: string; name?: string };

const NAME_MAX = 80;
const EMAIL_MAX = 254;
const EMAIL_PATTERN = /^[^\s@.][^\s@]*@[^\s@.][^\s@]*\.[^\s@]{2,}$/;

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
      message: "Something went wrong. Please try again.",
    };
  }

  const rawName = formData.get("name");
  const rawEmail = formData.get("email");
  const name = cleanName(rawName);
  const email = cleanEmail(rawEmail);

  if (!name) {
    return {
      step: "error",
      prevStep: "idle",
      message: "Name is required.",
      name: typeof rawName === "string" ? rawName : undefined,
      email: typeof rawEmail === "string" ? rawEmail : undefined,
    };
  }
  if (!email) {
    return {
      step: "error",
      prevStep: "idle",
      message: "Please enter a valid email.",
      name,
      email: typeof rawEmail === "string" ? rawEmail : undefined,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      data: { first_name: name },
    },
  });

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
      message: "Something went wrong. Please try again.",
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

  // Fire-and-forget Beehiiv subscribe. Must not block the auth success path.
  const beehiivKey = process.env.BEEHIIV_API_KEY;
  const beehiivPub = process.env.BEEHIIV_PUBLICATION_ID;
  if (beehiivKey && beehiivPub) {
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
            custom_fields: firstName
              ? [{ name: "First Name", value: firstName }]
              : undefined,
          }),
        },
      );
      if (!response.ok) {
        console.error(
          `[FINDGOD beehiiv] forward non-200: ${response.status} ${response.statusText}`,
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      console.error("[FINDGOD beehiiv] forward error:", msg);
    }
  }

  return { step: "success", firstName };
}
