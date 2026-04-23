import {
  streamText,
  convertToModelMessages,
  smoothStream,
  UIMessage,
} from "ai";
import { checkBotId } from "botid/server";
import { randomUUID } from "node:crypto";
import { compileSystemPrompt } from "@/lib/prompt-compiler";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  buildSetCookies,
  isEnforced,
  pickLimit,
  readChatState,
} from "@/lib/chat-limit";

// Vercel function max duration (seconds). Streaming responses from Claude
// typically finish in under 15s; 60s gives comfortable headroom.
export const maxDuration = 60;

/**
 * Name of the per-visitor session cookie. Not signed — tamper-resistance
 * isn't needed here because the cookie is only used to group chat rows in
 * the admin dashboard. Real enforcement (free-message limit) lives on the
 * signed cookie managed by lib/chat-limit.ts.
 */
const SESSION_COOKIE = "findgod_session_id";
const SESSION_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

/**
 * Read the session id from the incoming request, or mint a new one.
 * Returns { sessionId, isNew } so the caller can decide whether to set the
 * cookie on the outgoing response.
 */
function getOrCreateSessionId(req: Request): { sessionId: string; isNew: boolean } {
  const header = req.headers.get("cookie");
  if (header) {
    const match = header
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
    if (match) {
      const value = decodeURIComponent(match.slice(SESSION_COOKIE.length + 1));
      // Basic UUID shape check so a tampered cookie doesn't poison the DB.
      if (/^[0-9a-f-]{36}$/i.test(value)) {
        return { sessionId: value, isNew: false };
      }
    }
  }
  return { sessionId: randomUUID(), isNew: true };
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
    console.error(`[findgod/chat] insert ${table} failed:`, error.message);
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
    // ── 1. Bot check (Vercel BotID) ──────────────────────────────
    const verification = await checkBotId();
    if (verification.isBot) {
      return new Response(JSON.stringify({ error: "Access denied." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── Session id (per-visitor, used to group messages for admin views) ──
    const { sessionId, isNew: isNewSession } = getOrCreateSessionId(req);

    // ── 2. Supabase auth: authenticated users bypass the limit ───
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let firstName: string | null = null;
    let setCookies: string[] | null = null;
    const userId = user?.id ?? null;

    if (user) {
      firstName =
        (user.user_metadata?.first_name as string | undefined) ?? null;
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

    const { messages }: { messages: UIMessage[] } = await req.json();

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
      experimental_transform: smoothStream({
        chunking: "word",
        delayInMs: 18,
      }),
      providerOptions: {
        gateway: {
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
    // requests reuse the same id.
    if (isNewSession) {
      response.headers.append(
        "Set-Cookie",
        `${SESSION_COOKIE}=${sessionId}; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax; Secure`,
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
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
