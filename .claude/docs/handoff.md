# FINDGOD — Session Handoff

> **Read this first** at the start of any new session so you land on your feet.
> Last updated: 2026-04-18 · Lives at `.claude/docs/handoff.md`

---

## 📍 Where we are right now

**findgod.com is LIVE and fully Phase-B-ready.** In a single session we shipped: the full security pack, dynamic cliffhanger + multi-choice AI responses, Supabase OTP auth, a Claude-style home-page category panel with 25 pinpointed prompts, a custom cinematic OG share image, and a polished signup-wall UX with Latin crosses. IG launch slate is still staged and waiting on Higgsfield setup.

### The user's current mental model

- The AI chat IS the MVP. Authenticated users get unlimited chat, anonymous visitors get a random 3–5 message wall.
- The brand identity is locked. **Source of truth: `.claude/rules/brand-identity.md`.**
- Clothing/merch deferred to month 12-18+ (Yeezy / Essentials model — brand precedes product).
- **Tagline: TL07 "Iron sharpens iron." LOCKED 2026-04-18** — matches the signup-wall scripture anchor (Proverbs 27:17).
- **Content engine = Higgsfield Seedance 2.0.** Custom slash command `/project:findgod-post` at `.claude/commands/findgod-post.md` generates production-ready Seedance prompts + captions + hashtags from any topic. Positioned as the brand's moat since few Christian brands are on Seedance yet.
- **UX bar = wow factor, not default-standard.** Jones has said this twice: no cookie-cutter AI-startup patterns. Every interface moment should feel cinematic.

---

## 🔗 Live URLs

| URL | What it is |
|---|---|
| **https://findgod.com** | Production site with AI chat + OTP auth |
| **https://findgod.com/opengraph-image** | Custom 1200×630 share image (Archivo Black wordmark + gold glow) |
| **https://findgod.com/concepts, /v2, /v3, /v4** | Brand direction galleries |
| **https://findgod.com/concepts/open** | Live brainstorm page (locked-marks recap; tagline finalists removed since TL07 is now locked) |

---

## ✅ Brand identity — LOCKED

Source of truth: **`.claude/rules/brand-identity.md`**.

| Element | Locked direction |
|---|---|
| **Wordmark** | 06A — `FINDGOD` centered, Archivo Black 900, letter-spacing -0.03em |
| **Primary monogram** | M05B — the **888 Seal**. Favicon + Apple touch icon + AI loader pulse. |
| **Compact mark** | CM03 — the **F-Cross** (future merch + business cards). |
| **Primary lockup** | L05 — wordmark + `ΙΗΣΟΥΣ ≡ 888` Greek inscription subtitle. |
| **Scripture font** | ST06 — system serif italic (Georgia). Tested and rejected EB Garamond. |
| **Tagline** | **TL07 — "Iron sharpens iron." (Proverbs 27:17)** — LOCKED 2026-04-18 |
| **Primary palette** | Jet `#000000` / Bone `#F0EDE6` / Stone `#8B8680`. Gold `#C4A87C` rare accent. |
| **Inscription divider** | `ΙΗΣΟΥΣ ≡ 888` (JetBrains Mono, flanked by hairlines) replaces every section break. |

---

## ⚙️ Live tech stack

- **Next.js 16.2.3** (App Router, Turbopack) — project root at `/Users/jonespersen/Desktop/Find God/`
- **Vercel** hosting — team `edge-vitals-projects`, project `findgod`
- **Vercel AI Gateway** with **Claude Sonnet 4.6** — OIDC auth, no API key in code
- **Vercel AI SDK v6** (`ai`, `@ai-sdk/react`)
- **Vercel BotID** (`botid` npm) — blocks automated POSTs to `/api/chat` + signup server actions
- **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) — email OTP auth + user records. Project ID `vxrqsbvejzonapamnivu`.
- **react-markdown + remark-gfm** for AI message rendering
- **Tailwind 4** (via `@theme inline`)
- **next/font/google**: Inter, Archivo, JetBrains Mono, EB Garamond registered in `app/layout.tsx`
- **Bundled TTFs** in `public/fonts/`: ArchivoBlack-Regular.ttf + JetBrainsMono-Regular.ttf (for the OG image — Satori doesn't accept WOFF/WOFF2)
- **Beehiiv** for email capture — env vars NOT YET SET

### Environment variables (all set in Vercel except noted)

| Var | Status | Purpose |
|---|---|---|
| `VERCEL_OIDC_TOKEN` | ✅ Auto-managed | AI Gateway auth |
| `FINDGOD_COOKIE_SECRET` | ✅ Set | HMAC secret for the signed chat-count cookie |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Set | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Set | Browser-safe Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Set | Server-only admin key |
| `BEEHIIV_API_KEY` | ❌ Not set | Mirror verified signups to Daily Word list |
| `BEEHIIV_PUBLICATION_ID` | ❌ Not set | Same |
| `NEXT_PUBLIC_SITE_URL` | Not needed | `app/layout.tsx` auto-resolves via `VERCEL_PROJECT_PRODUCTION_URL` |

---

## 🎨 Current live UI — as of 2026-04-18

### Homepage empty state (anonymous visitor)

- No top nav. FINDGOD only in hero (Archivo Black clamp 56–120px).
- `ΙΗΣΟΥΣ ≡ 888` inscription divider beneath the wordmark, breathing at 4s pulse.
- **Live rotating encouraging message** — time-of-day aware (morning/midday/evening pools mixed with always-true lines).
- **Search bar** — multi-layer shadows + gold ring + ambient glow on focus + blur-in animated placeholder rotating every 3s.
- Send button = arrow-only white pill inside the input.
- **5 category chips:** `Wrestle · Overcome · Become · Heal · Begin`. Click chip → panel expands with 5 pinpointed first-person prompts (25 total). Click a prompt → sends as first message, chip collapses.
- **Instagram CTA** — compact pill with IG icon, links to `instagram.com/findgod`.
- **Brand promise pillars:** `SCRIPTURE-ANCHORED · UNAPOLOGETICALLY DIRECT · ALWAYS HERE`.
- **Footer:** `© 2026 FINDGOD LLC`.

### Homepage empty state (authenticated visitor)

- Same as above BUT the `LiveMessage` is replaced by `ReturningGreeting` — picks a time-of-day line with the user's first name (e.g. *"Back at it, Jon."*).
- The free-message wall never triggers for authenticated users.

### Cinematic effects

- **Vignette overlay** — radial darkening at edges.
- **Film grain** — inline SVG fractal noise at 4.5% opacity.
- **Cursor spotlight** (desktop only) — soft white ambient glow following the mouse (`rgba(255,255,255,0.05)`, 600px, 500ms ease-out). History: tested a dual-layer warm "ember" on 2026-04-18, Jones rejected as "typical of what AI does," rolled back. Don't redecorate without explicit ask.
- **Sequential entrance cascade** — every element fades up in a 900ms wave on first load.
- **Branded text selection** — `::selection` uses warm gold (`rgba(196,168,124,0.32)`).
- **Gold caret** in chat input (`caret-[#C4A87C]`).
- **Smooth scrolling** globally.
- **`prefers-reduced-motion` support** — reduces all animations to 0.01ms.

### AI chat response format (all 6 parts in `lib/findgod-system-prompt.ts`)

1. **Verdict** — bold 1–2 sentences
2. **Reasoning** — 2–4 sentences, Lie vs Truth contrast
3. **Scripture blockquote** — Georgia italic, gold border-left
4. **Action step** — `**Do this today:**` + 1–3 numbered items
5. **Close** — one sharp sentence
6. **```choices fenced block** — JSON with `question` + `options` (3–4 items). Parsed by `MultipleChoice` component in `chat-interface.tsx`; rendered as clickable buttons + "Something else — let me explain" escape that focuses the text input.

When to break format: casual messages / gospel questions / pure clarification / crisis (safety resources come first with NO choices block). Rules documented in the system prompt.

### AI name awareness

- `buildFindgodSystemPrompt({ firstName })` prepends a directive when firstName is present: "You are speaking with {firstName}. Use his name sparingly — never every response. Drop it in naturally at moments that land."
- `/api/chat/route.ts` calls `supabase.auth.getUser()` first. If authenticated, pulls `first_name` from `user_metadata` and passes it to the prompt builder. No cookie counter touched for authenticated users.

### Signup wall (anonymous → OTP → authenticated)

Card has a **warm gold aura** behind it (radial gradient blur) + **hairline of warm light** across the top edge. "Candle behind the altar" feel. Three-step flow (all in `app/signup-form.tsx`):

**Step 1 — `InitialView`** (first hit the wall):
- Proverbs 27:17 in Georgia italic
- `ΙΗΣΟΥΣ ≡ 888` inscription divider
- Headline: **"KEEP GOING."**
- Sub: "Sign in to keep the conversation going. Name and email only. We send one code to your inbox — no password to remember."
- Value stack with **Latin cross (†) icons** in gold:
    - Unlimited chat — no more three-message wall
    - Remembered — we'll greet you by name every time you come back
    - The Daily Word — one verse, one reflection, 6 AM every morning
    - Zero spam. Unsubscribe anytime.
- Form: `First name` + `Enter your email` + `I'm in`
- Fine print: `Free forever · Email only · 10 seconds`

**Step 2 — `CodeView`** (after submitting email):
- Minimal chrome — NO value stack, NO "KEEP GOING"
- `ΙΗΣΟΥΣ ≡ 888` inscription
- Headline: **"CHECK YOUR INBOX."**
- Sub: "We sent 6 digits to {email}. Paste them here to keep going."
- 6-digit code input — golden inner glow (`shadow-[0_0_60px_rgba(196,168,124,0.06)_inset]`), tracking 0.5em, autoFocus + `autoComplete="one-time-code"` so iOS can autofill.
- `Verify` button
- Small: `Didn't arrive? Check spam — or resend`

**Step 3 — `SuccessView`** (after verified):
- Inscription
- Georgia italic: `"You're in, {firstName}."`
- Small caps: `WELCOME TO THE FIRE`
- Auto-reloads after 2.2s so the session cookie takes effect in the chat interface.

### Dynamic chat limit (anonymous only)

- Random 3, 4, or 5 messages — picked once on a visitor's first `/api/chat` call.
- Stored in `findgod_chat_count` (HMAC-signed, HttpOnly) + `findgod_chat_meta` (plain, JS-readable for UI) cookies as `count:limit`.
- Client (`chat-interface.tsx`) reads `findgod_chat_meta` to show the blocker at the right message.
- Server enforces via `/api/chat` — returns 402 `LIMIT_REACHED` when bypassed.

---

## 🛡️ Security hardening (all live)

See `.claude/skills/security-engineer/SKILL.md` for the full attack-surface checklist.

- **Security headers** in `next.config.ts`: HSTS (2-year preload), X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Content-Security-Policy
- **Vercel BotID** via `instrumentation-client.ts` + `checkBotId()` on `/api/chat` and the signup server actions. Basic tier is on; Deep Analysis needs to be enabled in Vercel dashboard → Firewall → Rules.
- **Signed cookie counter** (`lib/chat-limit.ts`) — random 3–5 message limit, tamper-evident, HttpOnly
- **Error logging** sanitized to `error.name: error.message` only (keeps OIDC tokens / provider fragments out of downstream log systems)
- **Email regex** tightened — rejects `a@b.c`, leading-dot emails, addresses >254 chars
- **AI Gateway budget cap** — Jones to set in Vercel dashboard as a belt-and-suspenders cost guard

---

## 🚧 What's pending — in roughly priority order

1. **Instagram launch execution.** Bio, 11 posts, Seedance 2.0 prompts all staged in `.claude/docs/production-queue.md`. Jones's remaining actions:
    - Sign up for **Higgsfield** at higgsfield.ai, load ~$30 credit
    - Render the 888 Seal at 1024×1024 PNG from `app/apple-icon.svg` for the IG profile pic
    - Run one Seedance test clip to confirm aesthetic
    - Full production run on remaining 10 posts
    - Schedule in Meta Business Suite at 7 AM local for 11 consecutive days
2. **Beehiiv env vars** — set `BEEHIIV_API_KEY` + `BEEHIIV_PUBLICATION_ID` in Vercel. Until then, successful OTP verifies don't mirror to the Daily Word list.
3. **Custom SMTP for Supabase** — default Supabase SMTP has a 3 emails/hour rate limit that will throttle real traffic. Set up Resend (free: 100/day, 3K/month) as Supabase's custom SMTP via the dashboard. No code change.
4. **USPTO trademark** — file under FINDGOD LLC. Wordmark + 888 seal + F-Cross.
5. **Fiverr / production logo files** — vector versions (SVG/AI/EPS) of the locked marks.
6. **Phase B extensions** — Stripe premium tier; chat history persistence per user (Supabase Auth tables exist; need to add a `conversations`/`messages` schema).

---

## ⚠️ Don't repeat these mistakes

1. **Never put Next.js in a subfolder.** Crashed the system 4× (70–88 GB memory) via Turbopack workspace-root inference.
2. **Never create stray `package-lock.json`** in parent folders — same root cause.
3. **AI Gateway model slugs use DOTS**, not hyphens: `anthropic/claude-sonnet-4.6`.
4. **Next 16's `proxy.ts` must export a function named `proxy`**, NOT `middleware`. If wrong, dev server throws on every request and emits "The Proxy file /proxy must export a function named `proxy` or a default function."
5. **Satori (OG image renderer) demands TTF/OTF fonts** — WOFF/WOFF2 fail with "Unsupported OpenType signature wOF2." Keep the bundled TTFs in `public/fonts/` and load via `readFileSync`.
6. **`metadataBase` must resolve to the real prod URL.** Default fallback to `http://localhost:3000` made iMessage previews show a generic Vercel logo because og:image pointed at localhost. Fix in `app/layout.tsx` uses `VERCEL_PROJECT_PRODUCTION_URL` auto-var so this can't happen silently again.
7. **`fetch(new URL('./file', import.meta.url))`** doesn't work in Turbopack dev ("not implemented yet"). Use `readFileSync` from `node:fs` for bundled assets.
8. **Don't dress up the cursor spotlight.** Dual-layer warm ember with candlelight flicker was tested + rolled back on 2026-04-18: *"kind of typical of what AI does."*
9. **Avoid AI-typical visual flourishes generally.** Before shipping any cursor effect, hover state, ambient gradient, ask: *would this look at home on every other AI startup landing page?* If yes, simplify or kill it.
10. **Gmail MX records are sacred.** Web DNS changes touch A + CNAME only.
11. **Agent Browser is blocked by BotID in production.** agent-browser's Chrome for Testing trips `navigator.webdriver === true` and similar fingerprints. For automated UI verification, always test against localhost (BotID is a no-op in dev).

---

## 📂 Key files to know

| File | Purpose |
|---|---|
| `app/page.tsx` | Landing page server component (background overlays + chat + footer) |
| `app/layout.tsx` | Root layout + metadata (OG/Twitter). Uses `getSiteUrl()` to resolve canonical URL via Vercel auto env vars. |
| `app/chat-interface.tsx` | Chat UI client component. Contains: `ChatInterface` / `MessageBubble` / `MarkdownMessage` / `MultipleChoice` (parses ```choices blocks) / `CategoryPanel` / `ReturningGreeting` / `LiveMessage` / `SignupBlocker` / `InscriptionDivider` / `ThinkingIndicator`. Reads auth state via Supabase browser client. |
| `app/signup-form.tsx` | The three-step OTP auth blocker: `InitialView` / `CodeView` / `SuccessView`. Uses TWO `useActionState` hooks (requestOtp + verifyOtp). Owns all chrome — SignupBlocker is just a container. Includes the `CrossIcon` SVG. |
| `app/actions.ts` | Server actions: `requestOtp` sends the 6-digit code + stores name in `user_metadata`; `verifyOtp` verifies + pushes to Beehiiv (if env vars set). BotID-protected. |
| `app/api/chat/route.ts` | Chat API route. Defenses: BotID → Supabase auth check (skips cookie counter + injects firstName) → for anonymous visitors, signed cookie counter → streamText. |
| `app/cursor-spotlight.tsx` | Cursor-following soft white glow (client, desktop only) |
| `app/icon.svg` + `app/apple-icon.svg` | 888 Seal favicons |
| `app/opengraph-image.tsx` | Dynamic 1200×630 OG share image. Reads TTFs from `public/fonts/` via `readFileSync` at module load. Primary headline "The world is noise. This isn't." + subhead + layered gold glow. |
| `lib/findgod-system-prompt.ts` | `buildFindgodSystemPrompt({ firstName })` returns the voice + response-format rules. The ```choices block spec lives here. |
| `lib/chat-limit.ts` | HMAC cookie sign/verify, `pickLimit()` (random 3–5), `readChatState(req)`, `buildSetCookies(count, limit)`. |
| `lib/supabase/{client,server,middleware}.ts` | Three Supabase client helpers. Browser / server-action-or-route / middleware (updateSession). |
| `proxy.ts` | Next 16 routing middleware. Exports `proxy` (NOT middleware) that calls `updateSession`. Matcher excludes static assets. |
| `instrumentation-client.ts` | Registers BotID-protected routes: `/api/chat` + `/` (server actions on home page). |
| `next.config.ts` | Security headers + `withBotId` wrapper. |
| `.claude/commands/findgod-post.md` | Custom slash command that turns any topic into a production-ready IG post package (Seedance prompt + caption + hashtags). |
| `.claude/skills/agent-browser/` | Installed via `npx skills add vercel-labs/agent-browser`. Drives Chrome for automation. Blocked by BotID in prod — test against localhost. |
| `.claude/skills/security-engineer/SKILL.md` | Project-local pointer skill. Trigger for any Vercel/AI Gateway/Beehiiv/Supabase review, new API route, or "is this safe?" check. |
| `.claude/rules/brand-identity.md` | **The locked brand system source of truth** |
| `.claude/rules/brand-guidelines.md` | Voice rules |
| `.claude/rules/coding-style.md` | Code conventions |
| `.claude/docs/business-bible.md` | Strategy, mission, revenue model |
| `.claude/docs/strategic-plan.md` | Full 3-phase execution plan |
| `.claude/docs/icp.md` | Ideal customer profile |
| `.claude/docs/content-bank.md` | **11-post IG launch slate** with Seedance video prompts + static fallbacks |
| `.claude/docs/production-queue.md` | Per-day IG launch checklist, copy-paste-ready Seedance prompts + captions, bio copy |
| `.claude/docs/ai-bible-companion-spec.md` | Phase B extensions spec |
| `CLAUDE.md` (project root) | Auto-loaded context |

---

## 🔄 Common operations

**Deploy a change:**
```bash
cd "/Users/jonespersen/Desktop/Find God"
npx vercel@latest deploy --prod --yes
```

**Start dev server (port 3847 to avoid collisions):**
```bash
cd "/Users/jonespersen/Desktop/Find God"
npm run dev -- --port 3847
# http://localhost:3847
```

**Run full type-check:**
```bash
cd "/Users/jonespersen/Desktop/Find God"
npx tsc --noEmit
```

**Production build (catches OG generation issues):**
```bash
cd "/Users/jonespersen/Desktop/Find God"
npm run build
```

**Test chat API directly (BotID will block in prod):**
```bash
curl -X POST https://findgod.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"id":"1","role":"user","parts":[{"type":"text","text":"TEST MESSAGE"}]}]}'
# → Expect HTTP 403 "Access denied" (BotID doing its job)
```

**Force-refresh an iMessage / Slack / LinkedIn share preview cache:** share URL with a query string (`https://findgod.com/?v=2`) to bypass cache.

**Run security review:** invoke `anthropic-skills:security-engineer` via the Skill tool — full OWASP-mapped threat model of any change.

**Drive the browser locally:** `npx --yes agent-browser open http://localhost:3847` — skill installed in `.claude/skills/agent-browser/`. Only works against localhost (BotID blocks it in prod).

---

## 💬 Working with the founder

- **Not a developer.** Use plain English. Define any technical term. Avoid walls of text.
- **Prefers immediate action** over polish phases. "Move fast, ship, refine live."
- **Dislikes rigid numerical KPIs** — use "directional signals" framing.
- **Inclusive language preference** — target is 16–30 yo men but copy must NOT explicitly exclude women/older readers.
- **Use the AskUserQuestion tool for clarifying questions** — NOT bullet lists or prose paragraphs.
- **Mobile-first design.** Verify mobile layout at every step.
- **Own the deploy loop end-to-end.** Jones expects: local verify via agent-browser → deploy → prod sanity → report back with screenshots. Don't hand off "now click this, now click that" unless absolutely necessary.
- **Wow-factor UI** — reject cookie-cutter patterns. Everything should feel cinematic.
- **Always ask** before deleting files or installing new dependencies.

---

## 🎯 When starting a new session

1. **Read this file (`handoff.md`) first.**
2. Check `CLAUDE.md` in the project root for auto-loaded rules.
3. Check `.claude/rules/brand-identity.md` before any visual / brand decision.
4. Check `.claude/rules/brand-guidelines.md` before writing any copy.
5. Check `.claude/docs/strategic-plan.md` for the full sequence if making strategic decisions.
6. Ask the founder what they want to work on next — don't assume.
