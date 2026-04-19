"use client";

import { useActionState, useEffect, useState } from "react";
import { requestOtp, verifyOtp, type AuthState } from "./actions";
import { InscriptionDivider } from "./chat-interface";

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

  return (
    <InitialView
      pending={reqPending}
      action={reqAction}
      error={requestError}
      prefillName={prefillName}
      prefillEmail={prefillEmail}
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
}: {
  pending: boolean;
  action: (formData: FormData) => void;
  error: string | null;
  prefillName: string;
  prefillEmail: string;
}) {
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

      {/* Sub — clarifies that this is about continuing the chat, not a newsletter */}
      <p className="max-w-md text-center text-base leading-relaxed text-white/70">
        Sign in to keep the conversation going. Name and email only. We send one
        code to your inbox — no password to remember.
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
          <strong className="font-semibold text-white">Remembered</strong>
          {" \u2014 "}we&rsquo;ll greet you by name every time you come back.
        </ValueItem>
        <ValueItem>
          <strong className="font-semibold text-white">The Daily Word</strong>
          {" \u2014 "}one verse, one reflection, 6 AM every morning.
        </ValueItem>
        <ValueItem>
          <strong className="font-semibold text-white">Zero spam.</strong>{" "}
          Unsubscribe anytime.
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
          className="w-full rounded-full border border-white/20 bg-white/[0.05] px-6 py-3.5 text-base text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-[#C4A87C]/50 focus:bg-white/[0.08] focus:shadow-[0_0_40px_rgba(196,168,124,0.12)] focus:outline-none disabled:opacity-50"
        />
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <input
            type="email"
            name="email"
            required
            disabled={pending}
            autoComplete="email"
            defaultValue={prefillEmail}
            placeholder="Enter your email"
            aria-label="Email address"
            className="flex-1 rounded-full border border-white/20 bg-white/[0.05] px-6 py-3.5 text-base text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-[#C4A87C]/50 focus:bg-white/[0.08] focus:shadow-[0_0_40px_rgba(196,168,124,0.12)] focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-white px-7 py-3.5 text-base font-medium tracking-wide text-black transition-all hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Sending code…" : "Continue the conversation"}
          </button>
        </div>
      </form>

      {error && <p className="text-xs text-red-400/70">{error}</p>}

      {/* Fine print */}
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/30">
        Free forever · Email only · 10 seconds
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
          className="w-full rounded-2xl border border-[#C4A87C]/25 bg-white/[0.04] px-6 py-5 text-center text-3xl font-medium tracking-[0.5em] text-white caret-[#C4A87C] shadow-[0_0_60px_rgba(196,168,124,0.06)_inset] backdrop-blur-sm transition-all focus:border-[#C4A87C]/60 focus:bg-white/[0.07] focus:shadow-[0_0_60px_rgba(196,168,124,0.15)_inset,0_0_80px_rgba(196,168,124,0.12)] focus:outline-none disabled:opacity-50"
          style={{
            fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
          }}
          autoFocus
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-white px-7 py-3.5 text-sm font-medium tracking-wider text-black transition-all hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Verifying..." : "Verify"}
        </button>
      </form>

      {error && <p className="text-xs text-red-400/70">{error}</p>}

      <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">
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
        {firstName ? `You\u2019re in, ${firstName}.` : "You\u2019re in, brother."}
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
