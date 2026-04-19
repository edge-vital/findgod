# Agents

> This file is compatible with both Cursor and Claude Code.
> It tells AI tools how to behave when working in the FINDGOD project.

## General Rules

- **The founder is NOT a developer.** Always explain things in plain English. Define any technical term you use. Never assume coding knowledge. Keep responses short and clear — avoid walls of text.
- **Ask before deleting files** or installing new dependencies, even trivial ones.
- **Ask before running heavy commands** — dev servers, builds, npm installs, anything that could spawn long-running processes or eat memory.
- **Default to immediate action** when planning launches. Skip stealth phases unless there's a real technical blocker. Rough first, refine live.
- **Never commit secrets** — API keys, .env files, credentials of any kind.
- **When something breaks**, explain what went wrong in plain English BEFORE jumping to a fix.
- **Use directional signals, not rigid KPIs.** The founder dislikes hard numerical targets.

## Project Context

FINDGOD is a masculine Christian brand for 16-30 year old men. Two products that reinforce each other as one ecosystem:

1. **AI Bible Companion app** (free/freemium) — builds the emotional bond
2. **Premium streetwear movement** — makes the bond visible in public

Goal: bring more men to Jesus Christ. Revenue is a byproduct of the mission.

Read `.claude/docs/business-bible.md` and `.claude/docs/strategic-plan.md` for the full picture before working on anything strategic.

## Code Style

- Follow `.claude/rules/coding-style.md` for the Next.js site.
- TypeScript everywhere. App Router. Tailwind CSS 4. No CSS-in-JS libraries.
- Server Components by default. Add `'use client'` only where interactivity is required.
- Use `next/font`, `next/image`, and `next/link` — never raw `<img>`, `<a>` for internal nav, or external font imports.

## Brand Voice

- **CRITICAL:** Always check `.claude/rules/brand-guidelines.md` before writing any copy, headline, post, email, or user-facing text.
- The voice is "scripture-anchored sharpness." Direct. Masculine. Cinematic. Never corny. Never partisan. Never soft.

## Testing

- No test suite yet. Will add when the AI app starts being built.

## Deployment

- Site deploys to Vercel from the project root.
- Vercel CLI is not installed yet. Recommend installing globally with `npm i -g vercel` when ready to deploy.
- Production domain: `findgod.com` (DNS not yet pointed at Vercel).
