# Project: FINDGOD

> Root context for Claude. Auto-loaded every session. Keep under 150 lines.

## Overview

FINDGOD is a masculine Christian brand and digital ecosystem targeting 16-30 year old men. Built to bring more men to Jesus Christ through a cinematic, premium, unapologetic brand that doesn't feel corny. Positioned as "the Yeezy of faith" — an AI Bible Companion app + premium streetwear movement that reinforce each other. Free-form enough to grow into community, events, charities, and missions.

## Tech Stack

- **Landing page + AI app:** Next.js 16 (App Router), TypeScript, Tailwind CSS 4
- **Hosting:** Vercel (free tier to start)
- **AI brain:** OpenAI or Anthropic Claude API
- **Auth + database:** Supabase (when AI app is built)
- **Payments:** Stripe (when monetization starts)
- **Newsletter:** Beehiiv
- **Community:** Skool
- **Merch fulfillment:** Printful/Gelato → real manufacturer when volume justifies
- **Local dev runtime:** Node 24, npm

## Project Structure

- `app/` — Next.js App Router pages and components (landing page lives here)
- `public/` — Static assets (images, fonts, favicon)
- `.claude/docs/` — Strategy, business bible, ICP, content bank, day 1 checklist, full strategic plan
- `.claude/rules/` — Brand voice guidelines + code conventions Claude must follow
- `.claude/agents/` — Custom subagent definitions (future)
- `.claude/commands/` — Custom slash commands (future)
- `.claude/launch.json` — Local dev server config for Claude Preview

## Key Commands

- `npm run dev` — start the local dev server (http://localhost:3000)
- `npm run build` — production build
- `npm start` — run the production build locally

## Rules for Claude

- **Start here:** Read `.claude/docs/handoff.md` first for current live status, open loops, and recent decisions. This file stays evergreen; the handoff has the latest.
- **The founder is non-technical.** Use plain English. Define any coding term. Avoid walls of text. Keep responses short and clear.
- **Brand identity (LOCKED 2026-04-18):** Read `.claude/rules/brand-identity.md` before any visual decision. Wordmark, palette, marks (888 seal + F-Cross), lockup (L05), scripture font (Georgia italic), and the `ΙΗΣΟΥΣ ≡ 888` inscription system are locked. Tagline is the only open call (4 finalists narrowed; deferred until IG launch).
- **Brand voice:** Always check `.claude/rules/brand-guidelines.md` before writing copy or content. The voice is "scripture-anchored sharpness" — direct, masculine, never corny, never partisan. Note: target audience is 16-30 yo men, but copy should NOT explicitly exclude women/older readers.
- **Strategy:** Refer to `.claude/docs/business-bible.md`, `.claude/docs/icp.md`, and `.claude/docs/strategic-plan.md` for the full playbook. The refined sequence (2026-04-17) is: AI app + content → influencer amplification → clothing LAST (month 12-18+).
- **AI system prompt:** The FINDGOD voice is enforced in `lib/findgod-system-prompt.ts`. Edit there to change how the chat sounds.
- **Code style:** Follow `.claude/rules/coding-style.md` for the Next.js site.
- **Move fast.** Default to immediate action over stealth/polish phases. Rough first, refine live.
- **Mobile-first design.** Most visitors come from mobile — verify mobile layout at every step.
- **Use AskUserQuestion tool** (multi-choice popup) for clarifying questions — NOT bullet lists or prose paragraphs.
- **Ask before:** deleting files, installing dependencies, running heavy commands (dev servers, builds, AI API calls).
- **Use directional signals, not rigid KPIs.** Founder dislikes hard numerical targets.
- **Never commit:** secrets, API keys, .env files.
- **Legal name:** FINDGOD LLC (filed 2026-04-18). Copyright lines read "© 2026 FINDGOD LLC". Brand name everywhere else stays "FINDGOD".

## Important Context

- **Founder face is anonymous at launch.** Plan to step out around month 12 (Ryan Holiday / Daily Stoic model).
- **The flagship insight is the loop:** AI Bible Companion app (free) → emotional bond → premium streetwear (paid) → public visibility → more app users. Every product decision should reinforce this loop.
- **Aesthetic is non-negotiable:** dark, moody, cinematic, editorial. Deep blacks + muted earth tones + occasional gold. Reference: Alo, Stoic app, Daily Stoic, A24 films, monastery photography. Never bright, corny, or churchy.
- **Default Bible translation:** ESV or NKJV.
- **Memory crash precedent (2026-04-14/15):** A stray `~/package-lock.json` in the home folder plus placing the Next.js project inside a `site/` subfolder caused Turbopack to watch the entire home directory tree, crashing the system four times with 70-88 GB memory use. Fix: deleted the stray lockfile AND moved the Next.js project to the root of the `Find God/` folder (no subfolder). **Never put the Next.js project inside a subfolder.** Keep `package.json` at the project root. Never create stray `package-lock.json` files outside of project folders.
