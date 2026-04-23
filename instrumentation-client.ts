import { initBotId } from "botid/client/core";

/**
 * Vercel BotID — invisible bot-protection challenge.
 *
 * Routes listed here get an extra challenge header attached to outbound
 * requests; the server calls `checkBotId()` to verify. Local dev always
 * returns `isBot: false` so this does nothing until we're on Vercel.
 *
 * `/api/chat` — the AI chat stream (cost exploit surface)
 * `/`         — every server action invoked from the home page, including
 *               `subscribeToDailyWord` for the email signup form
 */
initBotId({
  protect: [
    { path: "/api/chat", method: "POST" },
    { path: "/api/track/landed", method: "POST" },
    { path: "/", method: "POST" },
  ],
});
