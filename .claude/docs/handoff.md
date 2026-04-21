# FINDGOD — Session Handoff

> **Read this first** at the start of any new session so you land on your feet.
> Last updated: 2026-04-21 · Lives at `.claude/docs/handoff.md`

---

## 📍 Where we are right now

**findgod.com is LIVE + admin-dashboard prereqs ~90% done.** Today (2026-04-21) we knocked out 6 of 9 sub-tasks in Part 1 of [The FINDGOD Command Center plan](~/.claude/plans/rustling-jingling-whale.md) — every prereq that had to land in the main FINDGOD repo before we stand up the separate admin project.

**Part 1 status:**
- ✅ 1.1 — Supabase migration (`messages`, `events`, `prompt_versions` tables with service-role-only RLS + 90-day pg_cron TTL). File: `supabase/migrations/20260419000001_admin_dashboard_schema.sql`
- ✅ 1.2 — `@vercel/analytics` installed + mounted in `app/layout.tsx`
- ✅ 1.3 — Migration run against production Supabase (via dashboard SQL editor)
- ✅ 1.4 — Chat persistence: every user + assistant turn writes to `messages` via onFinish in `app/api/chat/route.ts`; `first_message` + `hit_wall` events emit to `events`; session cookie introduced (`findgod_session_id`, 90-day, unsigned — not security-critical)
- ✅ 1.5 — `landed` event via `/api/track/landed` pinged by `app/landed-tracker.tsx` on mount; `signed_up` event in `app/actions.ts::verifyOtp` + user_id backfill onto prior anonymous messages/events so signed-up users see their full history
- ✅ 1.6 — **Pivoted from Edge Config → Supabase for the live prompt** (Hobby tier caps Edge Config at 8KB, our prompt is 12KB). `lib/active-system-prompt.ts` reads the active row from `prompt_versions` with a 60s in-memory cache. Seed row id: `f0b838f6-941a-4aac-9aac-b9e299c0b309`. Falls back to `lib/findgod-system-prompt.ts` if Supabase read fails.
- ✅ 1.8 — `jon@findgod.com` (Supabase user id `9a48abc3-3f53-4221-976a-967ec7db2ba5`) flipped to admin via **`app_metadata.role = 'admin'`** (NOT user_metadata — see "Don't repeat" #14). Set via Supabase admin API with service role key.
- ⏳ 1.7 — Beehiiv auto-sync: code is already wired in `app/actions.ts::verifyOtp` (was from 2026-04-18), just waiting on `BEEHIIV_API_KEY` + `BEEHIIV_PUBLICATION_ID` env vars being set in Vercel.
- ⏳ 1.9 — Privacy policy copy update (90-day retention + sensitive-category disclosure). Low priority until IG/ads launch.

**Part 2 (admin project shell) is gated on Jones sharing a UX/UI reference screenshot** so the visual direction is locked before build.

---

**Earlier (2026-04-19) we:**

1. Shipped an **adaptive AI response system** — responses are no longer rigid 6-part templates. First turn never gives "Do this today: 1, 2, 3" homework. Action steps only appear when earned by the conversation. Full rules live in `lib/findgod-system-prompt.ts`.
2. **Mobile UX pass** — multi-choice buttons lifted from near-invisible (`border/10 bg/3`) to prominent (`border/20 bg/6`, Inter font labels, gold hover). Input bar got brighter borders + gold focus ring. Killed the typewriter/JetBrains-Mono look inside chat replies (stayed on the home-page category label — that's brand-locked).
3. **Signup wall polish** — "I'm in" → **"Continue the conversation"** CTA. Inputs bumped to 16px (kills iOS zoom-on-focus). "KEEP GOING." now has proper word-spacing (was collapsing to "KEEPGOING." at tight `-0.02em` tracking).
4. **Fixed a mid-stream JSON leak** — the ```choices fenced block was briefly visible as raw `{"question":"…"` text during streaming because `parseChoices` only stripped it AFTER the closing fence arrived. Now strips from the opener forward the instant it appears. Fix in `app/chat-interface.tsx:parseChoices()`.
5. **Dev-only `/api/chat/reset` endpoint** added — visit `http://localhost:3000/api/chat/reset` in a browser to clear the signed cookie + meta + localStorage flag and land back on home with a fresh free-chat count. Returns 404 in production so it can't leak.
6. **Project is now a proper git repo on GitHub at `github.com/edge-vital/findgod`.** First commit: `abc730b`. Stray empty `/Users/jonespersen/.git` (which was breaking `git status`) was cleaned up. Vercel project is linked to the GitHub repo in dashboard. Push-to-main now SHOULD auto-deploy — but the first GitHub-triggered deploy hasn't fired yet (all prod deploys in the list still say "vercel deploy" = CLI). Production shipping today happened via `vercel deploy --prod` while we watch whether GitHub auto-deploy kicks in on the next push.

Earlier (2026-04-18) shipped: security pack, dynamic cliffhanger + multi-choice AI responses, Supabase OTP auth, 25-prompt category panel, cinematic OG share image, signup-wall chrome. IG launch slate still staged and waiting on Higgsfield setup.

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

### Supabase auth configuration (dashboard-managed, not code)

- **OTP length: 6** (was 8; changed 2026-04-21 because the UI expects 6-digit codes). If anyone bumps this back to 8, the signup flow breaks. Supabase Dashboard → Authentication → Providers → Email → OTP Length.

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

### AI chat response format — ADAPTIVE (rewritten 2026-04-19)

The system prompt in `lib/findgod-system-prompt.ts` is now intentionally loose. Key rules:

- **First turn in a conversation:** NEVER includes `**Do this today:**` or a numbered action list. First turn = recognition line + scripture (if it lands) + pinpointed ```choices question. The first response should feel like a fire lighting, not a manual being handed over.
- **Subsequent turns:** palette of pieces — opener, body, scripture blockquote (optional), action step (RARE — only when earned), close. NOT every response needs all of them. Back-to-back numbered action lists = off-voice.
- **```choices fenced block** — almost always required. JSON with `question` + `options` (3–4 short, mutually distinct). Parsed by `parseChoices()` + `MultipleChoice` in `chat-interface.tsx`; rendered as buttons + an "Or something else — type it below ↓" escape that focuses the text input.
- **Self-check list** runs in the prompt: *"Did I give homework last turn? Does this feel like a template? Am I giving action steps before he feels heard?"*
- **Streaming-safe:** `parseChoices()` hides the ```choices block from the moment the opener arrives, not just after the closer. Prevents the raw JSON leak that used to flicker during streams.

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
- Form: `First name` + `Enter your email` + **`Continue the conversation`** CTA (changed from "I'm in" on 2026-04-19 per Jones). Inputs are 16px (prevents iOS zoom-on-focus jank).
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
12. **A stray `.git` folder at `/Users/jonespersen/.git` silently broke local git ops.** `git status` from inside the project reported the entire home directory as untracked because git walked up and found that orphan `.git`. Cleaned up 2026-04-19. Same class of issue as the stray home-folder `package-lock.json` that crashed Turbopack. **Never run `git init` outside the project folder.** If a `git status` ever shows files from outside the project, stop and check `git rev-parse --show-toplevel`.
13. **Vercel dashboard "connect GitHub" may not backfill.** After wiring `edge-vital/findgod` to the Vercel project, Vercel did not auto-deploy from the first push we'd already made. Current deploys still trigger via `vercel deploy --prod` until we confirm the next git push fires a dashboard deployment. Don't assume auto-deploy works until a commit hash (not `vercel deploy`) shows up as the source in the Deployments tab.
14. **Vercel Edge Config on Hobby tier caps at 8KB total store size.** The FINDGOD AI system prompt is ~12KB, so it cannot fit. We tried on 2026-04-21 and got rejected by the API. We pivoted to Supabase-backed prompts with a 60s in-memory cache (`lib/active-system-prompt.ts`). Don't re-introduce Edge Config for the prompt unless the project upgrades to Pro (512KB per store) and there's a latency reason to move off Supabase. The empty Edge Config store `findgod-prompt` (id `ecfg_zgcan95qbl2acj5frdupdfvavea3`) still exists in Vercel — harmless, free, can be deleted via dashboard.
15. **Use `app_metadata`, NEVER `user_metadata`, for authorization flags.** `user_metadata` is writable by the authenticated user via the Supabase JS SDK — any signed-in user could flip their own `is_admin` flag. `app_metadata` is only settable via the service role key. The admin role for `jon@findgod.com` is stored as `app_metadata.role='admin'`. The admin dashboard gate must check `app_metadata.role`, not `user_metadata.role`.
16. **Fluid Compute module cache ≠ persistent.** The `lib/active-system-prompt.ts` in-memory cache is per-instance. Cold starts re-read Supabase. That's fine (30-50ms, amortized across ~60s × many requests) but don't assume it's guaranteed-hot. If we ever need fleet-wide cache invalidation after a prompt publish, we'll need Redis/KV or an Edge Config pointer — not in scope yet.

---

## 📂 Key files to know

| File | Purpose |
|---|---|
| `app/page.tsx` | Landing page server component (background overlays + chat + footer) |
| `app/layout.tsx` | Root layout + metadata (OG/Twitter). Uses `getSiteUrl()` to resolve canonical URL via Vercel auto env vars. |
| `app/chat-interface.tsx` | Chat UI client component. Contains: `ChatInterface` / `MessageBubble` / `MarkdownMessage` / `MultipleChoice` (parses ```choices blocks) / `CategoryPanel` / `ReturningGreeting` / `LiveMessage` / `SignupBlocker` / `InscriptionDivider` / `ThinkingIndicator`. Reads auth state via Supabase browser client. |
| `app/signup-form.tsx` | The three-step OTP auth blocker: `InitialView` / `CodeView` / `SuccessView`. Uses TWO `useActionState` hooks (requestOtp + verifyOtp). Owns all chrome — SignupBlocker is just a container. Includes the `CrossIcon` SVG. |
| `app/actions.ts` | Server actions: `requestOtp` sends the 6-digit code + stores name in `user_metadata`; `verifyOtp` verifies + pushes to Beehiiv (if env vars set). BotID-protected. |
| `app/api/chat/route.ts` | Chat API route. Defenses: BotID → Supabase auth check (skips cookie counter + injects firstName) → for anonymous visitors, signed cookie counter → streamText. Also: persists every user + assistant message via `onFinish`, emits `first_message` + `hit_wall` events, sets `findgod_session_id` cookie. |
| `app/api/chat/reset/route.ts` | **Dev-only** free-chat-wall reset. GET returns HTML that clears both cookies + the `findgod_free_chat_used` localStorage flag + redirects home. Returns 404 in production. Usage: `http://localhost:3000/api/chat/reset`. |
| `app/api/track/landed/route.ts` | Minimal POST endpoint fired once per session by `app/landed-tracker.tsx`. Writes `landed` event + sets `findgod_session_id` cookie if new. |
| `app/landed-tracker.tsx` | Invisible client component — `useEffect` pings `/api/track/landed` once per mount, sessionStorage-deduped against StrictMode double-fire. Mounted in `app/page.tsx`. |
| `lib/active-system-prompt.ts` | Resolves the live system prompt. Reads active `prompt_versions` row from Supabase with 60s in-memory cache + in-flight dedupe. Falls back to `lib/findgod-system-prompt.ts` on any failure. This is where the admin dashboard's "AI Training" edits show up at runtime. |
| `lib/supabase/service.ts` | Service-role Supabase client factory. Bypasses RLS — use ONLY server-side. Needed for writes to `messages`/`events`/`prompt_versions` (RLS service-only). |
| `supabase/migrations/20260419000001_admin_dashboard_schema.sql` | Initial admin-dashboard schema. Run once against production via Supabase SQL editor. Creates `messages` (90-day TTL via pg_cron), `events`, `prompt_versions` with service-role-only RLS. |
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

**Deploy a change — preferred (once GitHub auto-deploy is confirmed working):**
```bash
cd "/Users/jonespersen/Desktop/Find God"
git add .
git commit -m "short, why-focused message"
git push
# Vercel auto-builds in ~90s. Watch vercel.com/dashboard → findgod → Deployments.
```

**Deploy a change — fallback (if GitHub hook isn't firing):**
```bash
cd "/Users/jonespersen/Desktop/Find God"
vercel deploy --prod --yes
# Already authenticated as edge-vital. Takes ~40s.
```

**Reset the free-chat wall in local dev:**
Open `http://localhost:3000/api/chat/reset` in a browser. Clears cookies + localStorage, lands back on home with a fresh count. Prod-safe (404s in production).

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
