import type { Metadata } from "next";
import Link from "next/link";

/**
 * SMS Terms — the disclosure page our signup form's consent checkbox
 * links to. This is a TEMPLATE; have a lawyer review before sending
 * the first marketing text.
 *
 * Why it exists: TCPA (47 USC §227 + 47 CFR §64.1200) requires that
 * when we collect a phone number for SMS marketing, the user has access
 * to clear disclosure of (a) who's sending, (b) what kinds of messages,
 * (c) frequency, (d) cost disclaimer, (e) opt-out instructions, and
 * (f) the contact info to reach a human.
 *
 * Brand voice: scripture-anchored sharpness, but legal information must
 * be plain, complete, and unambiguous. Direct without being corny.
 */

export const metadata: Metadata = {
  title: "SMS Terms · FINDGOD",
  description:
    "How FINDGOD uses text messaging. Frequency, cost, how to stop, and who to reach.",
  robots: { index: false, follow: false },
};

export default function SmsTermsPage() {
  return (
    <main className="relative min-h-dvh bg-[#050507] px-6 py-16 sm:px-10 sm:py-24">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/"
          className="mb-10 inline-block text-[10px] uppercase tracking-[0.3em] text-white/60 hover:text-white"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          ← Back
        </Link>

        <h1
          className="mb-2 uppercase leading-[0.95] tracking-[-0.02em] text-white"
          style={{
            fontFamily: "var(--font-archivo)",
            fontWeight: 900,
            fontSize: "clamp(40px, 6vw, 64px)",
          }}
        >
          SMS Terms
        </h1>
        <p
          className="mb-12 text-[11px] uppercase tracking-[0.3em] text-white/55"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          Last updated · May 2026
        </p>

        <div
          className="flex flex-col gap-8 text-[15px] leading-[1.7] text-white/80"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <Section title="Who's sending">
            <p>
              FINDGOD LLC (Delaware), operating findgod.com, sends these text
              messages. Questions about a specific message or your account can
              go to{" "}
              <a
                href="mailto:hello@findgod.com"
                className="text-[#C4A87C]/90 underline-offset-2 hover:underline"
              >
                hello@findgod.com
              </a>
              .
            </p>
          </Section>

          <Section title="What we send">
            <p>
              When you provide your phone number and tick the consent box at
              signup, you agree to receive recurring marketing and transactional
              text messages from FINDGOD. These may include:
            </p>
            <ul className="ml-5 list-disc space-y-1.5 marker:text-white/50">
              <li>Daily or weekly devotional notes anchored in scripture</li>
              <li>Reminders to come back to a conversation you started</li>
              <li>Announcements about new features, content, or products</li>
              <li>Account-related notices (e.g. sign-in help)</li>
            </ul>
            <p>
              Consent to receive texts is not a condition of purchasing any
              product or service from FINDGOD.
            </p>
          </Section>

          <Section title="How often">
            <p>
              Message frequency varies. Expect no more than a handful per week
              under typical conditions.
            </p>
          </Section>

          <Section title="Cost">
            <p>
              Message and data rates may apply depending on your wireless
              carrier and plan. FINDGOD does not charge you to receive these
              messages.
            </p>
          </Section>

          <Section title="How to stop or get help">
            <p>
              You can opt out of FINDGOD text messages at any time by replying{" "}
              <strong className="text-white">STOP</strong> to any message you
              receive from us. After you reply STOP, you&rsquo;ll receive one
              confirmation text and then no further marketing messages.
            </p>
            <p>
              Reply <strong className="text-white">HELP</strong> at any time
              for assistance, or email{" "}
              <a
                href="mailto:hello@findgod.com"
                className="text-[#C4A87C]/90 underline-offset-2 hover:underline"
              >
                hello@findgod.com
              </a>
              .
            </p>
          </Section>

          <Section title="Carrier disclaimer">
            <p>
              Carriers (including but not limited to AT&amp;T, Verizon,
              T-Mobile, Sprint, U.S. Cellular, Cricket, Boost, MetroPCS, and
              Google Fi) are not liable for delayed or undelivered messages.
            </p>
          </Section>

          <Section title="Eligibility">
            <p>
              By providing your phone number and consenting, you confirm that
              you are at least 18 years old and that the number you provided
              belongs to you (or that you have authority to give consent for
              that number).
            </p>
          </Section>

          <Section title="Privacy">
            <p>
              We don&rsquo;t sell your phone number. We use it only to send the
              messages described above. The number is stored alongside your
              FINDGOD account record.
            </p>
          </Section>

          <Section title="Changes to these terms">
            <p>
              We may update these SMS Terms. Material changes will be posted on
              this page with a new &ldquo;Last updated&rdquo; date. Continuing
              to receive our texts after a change means you accept the updated
              terms.
            </p>
          </Section>
        </div>

        <p
          className="mt-16 text-center text-[10px] uppercase tracking-[0.3em] text-white/40"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          © 2026 FINDGOD LLC
        </p>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2
        className="text-[11px] uppercase tracking-[0.3em] text-[#C4A87C]/85"
        style={{ fontFamily: "var(--font-jetbrains)" }}
      >
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}
