"use client";

import { useActionState, useEffect, useState } from "react";
import { requestOtp, verifyOtp, type AuthState } from "./actions";
import { InscriptionDivider } from "@/components/inscription-divider";

const initialState: AuthState = { step: "idle" };

/**
 * The full signup-blocker content. Three distinct views:
 *
 *   1. Initial (idle)   — scripture anchor + headline + value stack + form
 *   2. Code             — minimal focused view: "CHECK YOUR INBOX" + code input
 *   3. Success          — brief welcome, then auto-reload into authenticated mode
 *
 * The content that makes sense on step 1 (value stack, "why sign in") is
 * aggressively stripped on step 2 — once the user has committed, showing
 * them the pitch again is noise. Step 2 is a single clear instruction:
 * type the code.
 *
 * Uses TWO useActionState hooks because React 19 binds one Server Action
 * per hook. Which view renders depends on reqState/verifyState values.
 */
export function SignupForm() {
  const [reqState, reqAction, reqPending] = useActionState(
    requestOtp,
    initialState,
  );
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyOtp,
    initialState,
  );

  // Auto-reload on success so the authenticated session cookie actually
  // takes effect in the chat interface.
  useEffect(() => {
    if (verifyState.step === "success") {
      const t = setTimeout(() => {
        window.location.reload();
      }, 2200);
      return () => clearTimeout(t);
    }
  }, [verifyState.step]);

  const step =
    verifyState.step === "success"
      ? "success"
      : reqState.step === "code" && verifyState.step !== "error"
        ? "code"
        : verifyState.step === "error"
          ? verifyState.prevStep === "code"
            ? "code"
            : "idle"
          : "idle";

  if (step === "success" && verifyState.step === "success") {
    return <SuccessView firstName={verifyState.firstName} />;
  }

  if (step === "code" && reqState.step === "code") {
    return (
      <CodeView
        email={reqState.email}
        name={reqState.name}
        pending={verifyPending}
        action={verifyAction}
        error={verifyState.step === "error" ? verifyState.message : null}
      />
    );
  }

  const requestError = reqState.step === "error" ? reqState.message : null;
  const prefillName =
    reqState.step === "error" && reqState.name ? reqState.name : "";
  const prefillEmail =
    reqState.step === "error" && reqState.email ? reqState.email : "";
  const prefillPhone =
    reqState.step === "error" && reqState.phone ? reqState.phone : "";

  return (
    <InitialView
      pending={reqPending}
      action={reqAction}
      error={requestError}
      prefillName={prefillName}
      prefillEmail={prefillEmail}
      prefillPhone={prefillPhone}
    />
  );
}

/* ================= INITIAL VIEW ================= */

function InitialView({
  pending,
  action,
  error,
  prefillName,
  prefillEmail,
  prefillPhone,
}: {
  pending: boolean;
  action: (formData: FormData) => void;
  error: string | null;
  prefillName: string;
  prefillEmail: string;
  prefillPhone: string;
}) {
  // Track the phone field locally so the SMS-consent block only becomes
  // ink-bright when the user is actually offering a number. The server
  // is the source of truth on whether consent is required — this is
  // purely a visual affordance.
  const [phoneTouched, setPhoneTouched] = useState(prefillPhone.length > 0);

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-7">
      {/* Scripture anchor */}
      <div className="flex flex-col items-center gap-2">
        <p
          className="max-w-xs text-center text-base italic leading-relaxed text-white/55"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          &ldquo;Iron sharpens iron, and one man sharpens another.&rdquo;
        </p>
        <p
          className="text-[10px] uppercase tracking-[0.3em] text-[#C4A87C]/70"
          style={{
            fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
          }}
        >
          Proverbs 27:17
        </p>
      </div>

      <InscriptionDivider />

      {/* Headline — direct, about continuing the conversation */}
      <h3
        className="text-center uppercase leading-[0.95] tracking-[-0.01em] text-white"
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 900,
          fontSize: "clamp(32px, 5vw, 52px)",
          wordSpacing: "0.12em",
        }}
      >
        Keep going.
      </h3>

      {/* Sub — clarifies that this is about continuing the chat */}
      <p className="max-w-md text-center text-base leading-relaxed text-white/70">
        Sign in to keep the conversation going. We send one code to your inbox —
        no password to remember.
      </p>

      {/* Value stack with Latin crosses */}
      <ul
        className="flex w-full max-w-md flex-col gap-3 text-left text-sm text-white/75"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <ValueItem>
          <strong className="font-semibold text-white">Unlimited chat</strong>
          {" \u2014 "}no more three-message wall.
        </ValueItem>
        <ValueItem>
          <strong className="font-semibold text-white">Known by name</strong>
          {" \u2014 "}you come back, it remembers.
        </ValueItem>
        <ValueItem>
          <strong className="font-semibold text-white">The Daily Word</strong>
          {" \u2014 "}one verse, one reflection, 6 AM every morning.
        </ValueItem>
        <ValueItem>
          <strong className="font-semibold text-white">Quiet inbox.</strong>{" "}
          Leave whenever.
        </ValueItem>
      </ul>

      {/* Form */}
      <form
        action={action}
        className="flex w-full max-w-md flex-col gap-3"
      >
        <input
          type="text"
          name="name"
          required
          disabled={pending}
          autoComplete="given-name"
          maxLength={80}
          defaultValue={prefillName}
          placeholder="First name"
          aria-label="First name"
          className="w-full rounded-xl border border-white/20 bg-white/[0.05] px-6 py-3.5 text-base text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-[#C4A87C]/50 focus:bg-white/[0.08] focus:shadow-[0_0_40px_rgba(196,168,124,0.12)] focus:outline-none disabled:opacity-50"
        />
        <input
          type="email"
          name="email"
          required
          disabled={pending}
          autoComplete="email"
          defaultValue={prefillEmail}
          placeholder="Email"
          aria-label="Email address"
          className="w-full rounded-xl border border-white/20 bg-white/[0.05] px-6 py-3.5 text-base text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-[#C4A87C]/50 focus:bg-white/[0.08] focus:shadow-[0_0_40px_rgba(196,168,124,0.12)] focus:outline-none disabled:opacity-50"
        />
        <input
          type="tel"
          name="phone"
          disabled={pending}
          autoComplete="tel"
          inputMode="tel"
          maxLength={20}
          defaultValue={prefillPhone}
          placeholder="Phone (optional)"
          aria-label="Phone number (optional)"
          onChange={(e) => setPhoneTouched(e.currentTarget.value.length > 0)}
          className="w-full rounded-xl border border-white/20 bg-white/[0.05] px-6 py-3.5 text-base text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-[#C4A87C]/50 focus:bg-white/[0.08] focus:shadow-[0_0_40px_rgba(196,168,124,0.12)] focus:outline-none disabled:opacity-50"
        />

        {/* SMS consent block. Only ink-bright when a phone is present.
            Both checkboxes are server-enforced when phone is filled, so
            the visual fading here is purely UX. The on-screen TCPA text is
            kept short; the full express-consent text is snapshotted into
            user_metadata.sms_consent for the legal record. */}
        <div
          className={`flex flex-col gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 transition-opacity ${
            phoneTouched ? "opacity-100" : "opacity-55"
          }`}
        >
          <label className="flex cursor-pointer items-start gap-2.5 text-left text-[12px] leading-[1.5] text-white/75">
            <input
              type="checkbox"
              name="sms_consent"
              disabled={pending}
              className="mt-0.5 h-4 w-4 flex-none cursor-pointer accent-[#C4A87C]"
            />
            <span>
              <strong className="font-semibold text-white">Text me.</strong> I
              agree to receive recurring marketing &amp; transactional texts
              from FINDGOD. Msg &amp; data rates may apply. Reply{" "}
              <span className="font-semibold">STOP</span> to opt out,{" "}
              <span className="font-semibold">HELP</span> for help.{" "}
              <a
                href="/sms-terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C4A87C]/85 underline-offset-2 hover:underline"
              >
                SMS Terms
              </a>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2.5 text-left text-[12px] leading-[1.5] text-white/75">
            <input
              type="checkbox"
              name="age_confirm"
              disabled={pending}
              className="mt-0.5 h-4 w-4 flex-none cursor-pointer accent-[#C4A87C]"
            />
            <span>I&rsquo;m 18 or older.</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#F0EDE6] px-7 py-3.5 text-base font-medium tracking-wide text-black transition-all hover:bg-[#F0EDE6]/90 hover:shadow-[0_0_30px_rgba(240,237,230,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Sending code…" : "Continue the conversation"}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="text-center text-xs tracking-wide text-white/60"
        >
          <span aria-hidden className="mr-2 text-[#C4A87C]/70">
            —
          </span>
          {error}
          <span aria-hidden className="ml-2 text-[#C4A87C]/70">
            —
          </span>
        </p>
      )}

      {/* Fine print */}
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">
        Free · No password · Phone optional
      </p>
    </div>
  );
}

/* ================= CODE VIEW ================= */

function CodeView({
  email,
  name,
  pending,
  action,
  error,
}: {
  email: string;
  name: string;
  pending: boolean;
  action: (formData: FormData) => void;
  error: string | null;
}) {
  return (
    <div className="flex flex-col items-center gap-7">
      <InscriptionDivider />

      <h3
        className="text-center uppercase leading-[0.95] tracking-[-0.02em] text-white"
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 900,
          fontSize: "clamp(28px, 4.5vw, 44px)",
        }}
      >
        Check your inbox.
      </h3>

      <p
        className="max-w-sm text-center text-[15px] leading-relaxed text-white/70"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        We sent 6 digits to{" "}
        <span className="text-white/95">{email}</span>. Paste them here to keep
        going.
      </p>

      <form action={action} className="flex w-full max-w-sm flex-col gap-4">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="name" value={name} />
        <input
          type="text"
          name="code"
          required
          disabled={pending}
          autoComplete="one-time-code"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="000000"
          aria-label="6-digit code"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "otp-error" : undefined}
          className="w-full rounded-2xl border border-[#C4A87C]/25 bg-white/[0.04] px-6 py-5 text-center text-3xl font-medium tracking-[0.5em] text-white caret-[#C4A87C] shadow-[0_0_60px_rgba(196,168,124,0.06)_inset] backdrop-blur-sm transition-all focus:border-[#C4A87C]/60 focus:bg-white/[0.07] focus:shadow-[0_0_60px_rgba(196,168,124,0.15)_inset,0_0_80px_rgba(196,168,124,0.12)] focus:outline-none disabled:opacity-50"
          style={{
            fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
          }}
          autoFocus
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#F0EDE6] px-7 py-3.5 text-sm font-medium tracking-wider text-black transition-all hover:bg-[#F0EDE6]/90 hover:shadow-[0_0_30px_rgba(240,237,230,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Verifying..." : "Verify"}
        </button>
      </form>

      {error && (
        <p
          id="otp-error"
          role="alert"
          className="text-center text-xs tracking-wide text-white/60"
        >
          <span aria-hidden className="mr-2 text-[#C4A87C]/70">
            —
          </span>
          {error}
          <span aria-hidden className="ml-2 text-[#C4A87C]/70">
            —
          </span>
        </p>
      )}

      <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">
        Didn&rsquo;t arrive? Check spam — or{" "}
        <ResendHint email={email} name={name} />
      </p>
    </div>
  );
}

/* ================= SUCCESS VIEW ================= */

function SuccessView({ firstName }: { firstName: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <InscriptionDivider />
      <p
        className="max-w-md text-center text-2xl italic text-white/90"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {firstName ? `You\u2019re in, ${firstName}.` : "You\u2019re in. Welcome."}
      </p>
      <p
        className="text-[11px] uppercase tracking-[0.35em] text-[#C4A87C]/70"
        style={{
          fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
        }}
      >
        Welcome to the fire
      </p>
    </div>
  );
}

/* ================= CROSS ICON + VALUE ITEM ================= */

/**
 * Latin-cross glyph used instead of the generic check. On brand — the
 * cross is the anchor of everything FINDGOD stands for. Proportions match
 * a Latin crucifix: horizontal bar placed above center, vertical bar
 * extending below.
 */
function CrossIcon() {
  return (
    <svg
      width="11"
      height="13"
      viewBox="0 0 11 13"
      aria-hidden="true"
      className="flex-none"
      fill="currentColor"
    >
      <rect x="4.5" y="0" width="2" height="13" />
      <rect x="1" y="3.5" width="9" height="2" />
    </svg>
  );
}

function ValueItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden
        className="mt-[0.45em] flex h-5 w-5 flex-none items-center justify-center text-[#C4A87C]"
      >
        <CrossIcon />
      </span>
      <span className="leading-[1.6]">{children}</span>
    </li>
  );
}

/* ================= RESEND HINT ================= */

function ResendHint({ email, name }: { email: string; name: string }) {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function resend() {
    if (pending || sent) return;
    setPending(true);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("name", name);
    await requestOtp({ step: "idle" }, fd);
    setPending(false);
    setSent(true);
  }

  return (
    <button
      type="button"
      onClick={resend}
      disabled={pending || sent}
      className="text-[#C4A87C]/80 underline-offset-2 hover:underline disabled:opacity-50"
    >
      {sent ? "sent" : pending ? "sending..." : "resend"}
    </button>
  );
}
