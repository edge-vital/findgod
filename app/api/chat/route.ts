import {
  streamText,
  convertToModelMessages,
  smoothStream,
  UIMessage,
} from "ai";
import { checkBotId } from "botid/server";
import { compileSystemPrompt } from "@/lib/prompt-compiler";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  buildSetCookies,
  isEnforced,
  pickLimit,
  readChatState,
} from "@/lib/chat-limit";
import { newSessionId, verifySessionId } from "@/lib/session-cookie";

// Vercel function max duration (seconds). Streaming responses from Claude
// typically finish in under 15s; 60s gives comfortable headroom.
export const maxDuration = 60;

/**
 * Cost-DOS caps. A single authenticated user with no rate limit could
 * issue thousands of unbounded turns/day; without these, one bad actor
 * can drive Claude API costs into the hundreds of dollars before any
 * backstop fires.
 *
 * - MAX_BODY_BYTES: Reject 50MB JSON bodies before parse. 64KB fits a
 *   60-message thread of 1KB each comfortably.
 * - MAX_MESSAGES: Cap conversation depth so attackers can't forge a
 *   10K-turn history that bills as input tokens.
 * - MAX_MESSAGE_TEXT_CHARS: Per-message text cap. A user typing a long
 *   confession gets 4KB; that's ~1000 words, more than any realistic
 *   chat input.
 * - MAX_DAILY_AUTHED_MESSAGES: Per-authenticated-user rolling 24h cap.
 *   Anonymous visitors hit the 3–5 cookie wall; without this, signing
 *   up via OTP unlocks unlimited spend.
 * - MAX_OUTPUT_TOKENS: FINDGOD responses are short by design — verse
 *   + 2-4 paragraphs + choices block. 1500 tokens is generous.
 */
const MAX_BODY_BYTES = 64 * 1024;
const MAX_MESSAGES = 60;
const MAX_MESSAGE_TEXT_CHARS = 4_000;
// Per-message parts cap. Realistic AI SDK UIMessage parts: 1–3 (text +
// optional tool / file). Bound this so an attacker can't bypass the body
// cap by sending one message with 10K small parts (40MB total under the
// per-part limit). 20 is generous and leaves room for future part types.
const MAX_PARTS_PER_MESSAGE = 20;
const MAX_DAILY_AUTHED_MESSAGES = 100;
const MAX_OUTPUT_TOKENS = 1_500;

/**
 * Name of the per-visitor session cookie. HMAC-SIGNED via FINDGOD_COOKIE_SECRET
 * (lib/session-cookie.ts). The signature prevents forgery — an attacker can
 * no longer hand-set this cookie before signup to claim another visitor's
 * anonymous chat history at OTP-verify time.
 */
const SESSION_COOKIE = "findgod_session_id";
const SESSION_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

/**
 * Read the session id from the incoming request, or mint a new one.
 * Verifies the HMAC signature on read; an unsigned/forged/expired cookie
 * is treated as a fresh visitor and a new signed cookie is issued.
 * Returns { sessionId, signed, isNew } so the caller can decide whether
 * to set the cookie on the outgoing response.
 */
function getOrCreateSessionId(
  req: Request,
): { sessionId: string; signed: string; isNew: boolean } {
  const header = req.headers.get("cookie");
  if (header) {
    const match = header
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
    if (match) {
      const raw = decodeURIComponent(match.slice(SESSION_COOKIE.length + 1));
      const verified = verifySessionId(raw);
      if (verified) {
        return { sessionId: verified, signed: raw, isNew: false };
      }
      // Unsigned / forged / expired — fall through and mint a new one.
    }
  }
  const fresh = newSessionId();
  return { sessionId: fresh.sessionId, signed: fresh.signed, isNew: true };
}

/**
 * Best-effort insert into an admin table. Fire-and-forget: the chat UX must
 * not block or fail on analytics writes. Logs errors but never throws.
 */
async function safeInsert(
  table: "messages" | "events",
  row: Record<string, unknown>,
): Promise<void> {
  const { error } = await createServiceClient().from(table).insert(row);
  if (error) {
    // Log only `error.code` — Supabase PostgREST error.message and
    // error.details can include the failing row's values on constraint
    // violations, which for the `messages` table means leaking user chat
    // content (sensitive-category data) into Vercel logs. Code alone is
    // enough to diagnose (e.g. 23505 = unique violation, PGRST116 = missing
    // table, 42501 = insufficient privilege).
    console.error(
      `[findgod/chat] insert ${table} failed:`,
      error.code ?? "unknown",
    );
  }
}

/**
 * FINDGOD chat route.
 *
 * Defenses (in order):
 * 1. Vercel BotID — invisible challenge blocks automated clients.
 * 2. Supabase auth — if the user is logged in (verified OTP), skip the
 *    free-message limit entirely and inject their first name into the
 *    system prompt. Otherwise fall through to the cookie counter below.
 * 3. Signed-cookie counter — random 3–5 free messages per anonymous
 *    visitor, locked via signed cookie across reloads.
 *
 * BotID is a no-op in local dev. The cookie counter also disables in dev
 * when no secret is set, so `npm run dev` works without env setup.
 *
 * After the defenses pass, every incoming message is persisted to the
 * `messages` table (role=user pre-stream, role=assistant on onFinish) and
 * funnel events are emitted to the `events` table. Both writes are
 * fire-and-forget — admin observability never degrades the chat UX.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    // ── Body size pre-check (synchronous, free) ──────────────────
    // Reject oversize bodies before we even start reading them.
    // Content-Length isn't always honest, but if it's set and large
    // we save a JSON parse + memory burn.
    const contentLength = req.headers.get("content-length");
    if (contentLength) {
      const declared = Number.parseInt(contentLength, 10);
      if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
        return new Response(
          JSON.stringify({ error: "Request too large." }),
          { status: 413, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    // ── Session id (sync cookie read + HMAC verify) ───────────────
    const {
      sessionId,
      signed: signedSession,
      isNew: isNewSession,
    } = getOrCreateSessionId(req);

    // ── Fire 3 independent async tasks in parallel ───────────────
    // BotID verification, Supabase user lookup, and body parse have
    // no dependencies on each other. Serial awaits were adding ~100ms
    // to first-token latency for no benefit. We still await BotID
    // first to fail fast on bots (the other two complete in the
    // background and their results are discarded if BotID fails).
    const botPromise = checkBotId();
    const authPromise = (async () => {
      const client = await createClient();
      const {
        data: { user: u },
      } = await client.auth.getUser();
      return { client, user: u };
    })();
    const bodyPromise = req.json() as Promise<{ messages: UIMessage[] }>;

    // ── 1. Bot check (Vercel BotID) — fail fast ──────────────────
    const verification = await botPromise;
    if (verification.isBot) {
      return new Response(JSON.stringify({ error: "Access denied." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── 2. Supabase auth: authenticated users bypass the limit ───
    const { client: supabase, user } = await authPromise;

    let firstName: string | null = null;
    let setCookies: string[] | null = null;
    const userId = user?.id ?? null;

    if (user) {
      firstName =
        (user.user_metadata?.first_name as string | undefined) ?? null;

      // ── Per-user daily message budget ─────────────────────────
      // Authenticated users skip the anonymous cookie wall; without a
      // separate cap, a free OTP signup unlocks unlimited token spend.
      // Count user messages in the rolling 24h window. A misconfigured
      // count query fails open (don't lock real users out on infra
      // hiccups) but logs the error for visibility.
      const oneDayAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString();
      const { count: dailyCount, error: countError } = await createServiceClient()
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("role", "user")
        .gte("created_at", oneDayAgo);

      if (countError) {
        console.error(
          "[findgod/chat] daily count failed:",
          countError.code ?? "unknown",
        );
      } else if (
        typeof dailyCount === "number" &&
        dailyCount >= MAX_DAILY_AUTHED_MESSAGES
      ) {
        return new Response(
          JSON.stringify({
            error:
              "You've reached today's message limit. Take a breath. Open scripture. Come back tomorrow.",
            code: "DAILY_LIMIT_REACHED",
          }),
          { status: 429, headers: { "Content-Type": "application/json" } },
        );
      }
    } else {
      // ── 3. Anonymous visitor — enforce cookie counter ──────────
      const existing = readChatState(req);
      const { count, limit } = existing ?? { count: 0, limit: pickLimit() };

      if (isEnforced() && count >= limit) {
        void safeInsert("events", {
          event_type: "hit_wall",
          session_id: sessionId,
          user_id: userId,
        });
        return new Response(
          JSON.stringify({
            error: "Free limit reached. Sign up to continue.",
            code: "LIMIT_REACHED",
          }),
          {
            status: 402,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      setCookies = buildSetCookies(count + 1, limit);
    }

    const { messages } = await bodyPromise;

    // ── Message-array shape + size validation ────────────────────
    // Reject malformed arrays AND forged 10K-turn histories. Each
    // user/assistant turn after this point bills as input tokens; an
    // attacker can't be trusted to send a sane shape.
    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request body." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    if (messages.length > MAX_MESSAGES) {
      return new Response(
        JSON.stringify({ error: "Conversation too long. Start a new chat." }),
        { status: 413, headers: { "Content-Type": "application/json" } },
      );
    }
    for (const msg of messages) {
      if (!msg?.parts || !Array.isArray(msg.parts)) continue;
      // Cap parts per message — closes a bypass where an attacker omits
      // Content-Length (chunked encoding) and sends one message with
      // thousands of small parts, evading the body-size ceiling.
      if (msg.parts.length > MAX_PARTS_PER_MESSAGE) {
        return new Response(
          JSON.stringify({ error: "Message has too many parts." }),
          { status: 413, headers: { "Content-Type": "application/json" } },
        );
      }
      for (const part of msg.parts) {
        if (
          part?.type === "text" &&
          "text" in part &&
          typeof part.text === "string" &&
          part.text.length > MAX_MESSAGE_TEXT_CHARS
        ) {
          return new Response(
            JSON.stringify({ error: "Message too long." }),
            { status: 413, headers: { "Content-Type": "application/json" } },
          );
        }
      }
    }

    // Pull the most recent user message for persistence. UIMessage parts
    // can hold text + other blocks; we only persist text content.
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    const lastUserText = lastUserMessage?.parts
      ?.filter((p) => p.type === "text")
      ?.map((p) => ("text" in p ? p.text : ""))
      .join("")
      ?? "";

    // conversation_id groups all messages in this session together. For V1
    // one session == one conversation (future: "new chat" button can reset).
    const conversationId = sessionId;

    // Count user messages we've seen so far (including the incoming one).
    // This tells us if this is the session's first turn — for first_message.
    const userMessageCount = messages.filter((m) => m.role === "user").length;

    // Persist the user's message immediately — fire-and-forget so it doesn't
    // block first-token latency. If the stream later fails we at least know
    // what they asked.
    if (lastUserText) {
      void safeInsert("messages", {
        conversation_id: conversationId,
        session_id: sessionId,
        user_id: userId,
        role: "user",
        content: lastUserText,
      });
    }

    // First-message funnel event — fires exactly once per session.
    if (userMessageCount === 1) {
      void safeInsert("events", {
        event_type: "first_message",
        session_id: sessionId,
        user_id: userId,
      });
    }

    const result = streamText({
      model: "anthropic/claude-sonnet-4.6",
      system: await compileSystemPrompt({ firstName, userMessage: lastUserText }),
      messages: await convertToModelMessages(messages),
      // FINDGOD responses are short by design: opener + scripture +
      // 2-4 paragraphs + choices block. 1500 tokens is generous and
      // caps the worst-case output cost per turn.
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      experimental_transform: smoothStream({
        chunking: "word",
        delayInMs: 18,
      }),
      providerOptions: {
        gateway: {
          // Anthropic prompt caching via AI Gateway. `caching: "auto"` tells
          // the gateway to add a `cache_control: { type: "ephemeral" }`
          // breakpoint at the end of our static content (the system prompt).
          // On a cache hit, Anthropic charges ~10% of normal input-token
          // price for the cached prefix — a ~90% cost reduction on the
          // ~12KB base prompt that every turn carries.
          //
          // Safe for our compiler output: the appended personality section
          // is stable for 60s via ttl-cache, so cache hit rate stays high.
          // When M4 RAG ships, the dynamic chunks should go AFTER the
          // system prompt (in a user message or separate block) to keep
          // this cache breakpoint useful.
          caching: "auto",
          tags: [
            "feature:chat",
            "surface:landing",
            userId ? "user_type:authed" : "user_type:anon",
          ],
        },
      },
      onFinish: async ({ text }) => {
        // Persist the assistant response once streaming completes.
        //
        // IMPORTANT: await this. The AI SDK keeps the response stream
        // open until onFinish resolves, which in turn keeps the
        // serverless function alive. Fire-and-forget (`void safeInsert`)
        // races the function teardown and dropped ~40% of assistant
        // responses in practice (diagnosed 2026-04-22 via Supabase row
        // counts: 12 user msgs vs 7 assistant msgs).
        if (text) {
          await safeInsert("messages", {
            conversation_id: conversationId,
            session_id: sessionId,
            user_id: userId,
            role: "assistant",
            content: text,
          });
        }
      },
    });

    const response = result.toUIMessageStreamResponse();

    // Only set the counter cookies for anonymous visitors — authenticated
    // users don't need tracking; their session cookie already identifies them.
    if (setCookies) {
      for (const c of setCookies) {
        response.headers.append("Set-Cookie", c);
      }
    }

    // Set the session cookie on first sight of a visitor so subsequent
    // requests reuse the same id. HttpOnly + signed value (HMAC) — see
    // lib/session-cookie.ts. HttpOnly closes the XSS-to-session-hijack
    // chain (M-1); HMAC closes the cookie-forge-then-signup-to-claim-
    // history attack (M-2).
    if (isNewSession) {
      response.headers.append(
        "Set-Cookie",
        `${SESSION_COOKIE}=${encodeURIComponent(signedSession)}; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax; Secure; HttpOnly`,
      );
    }

    return response;
  } catch (error) {
    // Log only name + message. The raw error object can contain upstream
    // provider response fragments, OIDC token bits, or user-message echoes;
    // keep that out of logs in case logs ever flow to a third party later.
    const summary =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : "unknown error";
    console.error("[findgod/chat] Error:", summary);
    return new Response(
      JSON.stringify({ error: "Something broke on our end. One more try." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
