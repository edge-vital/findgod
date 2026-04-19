import {
  streamText,
  convertToModelMessages,
  smoothStream,
  UIMessage,
} from "ai";
import { checkBotId } from "botid/server";
import { buildFindgodSystemPrompt } from "@/lib/findgod-system-prompt";
import { createClient } from "@/lib/supabase/server";
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

    // ── 2. Supabase auth: authenticated users bypass the limit ───
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let firstName: string | null = null;
    let setCookies: string[] | null = null;

    if (user) {
      firstName =
        (user.user_metadata?.first_name as string | undefined) ?? null;
    } else {
      // ── 3. Anonymous visitor — enforce cookie counter ──────────
      const existing = readChatState(req);
      const { count, limit } = existing ?? { count: 0, limit: pickLimit() };

      if (isEnforced() && count >= limit) {
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

    const result = streamText({
      model: "anthropic/claude-sonnet-4.6",
      system: buildFindgodSystemPrompt({ firstName }),
      messages: await convertToModelMessages(messages),
      experimental_transform: smoothStream({
        chunking: "word",
        delayInMs: 18,
      }),
      providerOptions: {
        gateway: {
          tags: ["feature:chat", "surface:landing"],
        },
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
