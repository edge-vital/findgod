# Business Bible — FINDGOD

> The core document that captures the FINDGOD strategy, mission, and key decisions. Claude references this to understand the "why" behind every project decision.

## Mission

Bring more men to Jesus Christ. FINDGOD exists to reach the lost, anxious, disenfranchised young man with masculine biblical wisdom delivered through a brand that finally doesn't feel corny.

## Vision

FINDGOD becomes "the Yeezy of faith" — a cinematic, premium, unapologetic Christian brand that owns the masculine modern faith lane. Within 12 months: an established Instagram following, an AI Bible Companion in active daily use, 3-5 aligned creator partnerships. Within 18 months: the first quiet clothing capsule (Yeezy / Essentials model — brand precedes product). Within 3 years: a multi-stream movement spanning content, app, merch, community, events, and missions.

## Core Values

- **Truth over comfort.** Say the hard thing. Let scripture swing the hammer.
- **Strength over softness.** No fake positivity. No half-smiles.
- **Brotherhood over isolation.** Men were made to walk together.
- **Excellence over scarcity thinking.** Premium production, premium aesthetic, premium experience.
- **Mission over money.** Revenue is a byproduct of changing lives.
- **Action over polish.** Ship live, refine in public.

## Target Customer

The 16-30 year old man who is lost, anxious, overwhelmed, and quietly searching for meaning. He's sick of corny Christian branding and tired of the noise (algorithms, news, validation games, financial pressure). He's hungry for discipline, purpose, and brotherhood. See `.claude/docs/icp.md` for the full profile.

## Revenue Model — Refined Sequence (2026-04-17)

Order of monetization, chosen so each step earns the right to the next. Clothing moves LATE in the sequence — the brand must precede the product (Yeezy / Fear of God Essentials model).

1. **Free content** (Instagram, TikTok, YouTube, daily email) — ongoing · pure value, builds the audience
2. **Free AI Bible Companion app** — months 3-6 · builds the emotional bond, no paywall
3. **AI Companion premium tier** — $4.99/month · months 6-9 · optional upgrade for power users
4. **Aligned creator/influencer partnerships** — months 6-12 · amplification, not paid endorsements · brand trust layer
5. **Paid newsletter tier** — $9/month · months 9-12 · Sunday long-form essay + audio + Q&A
6. **First clothing capsule** — months 12-18 · quiet release · given, not gimmick (see Clothing Philosophy below)
7. **Paid Skool community** — $19-29/month · year 2 · "Brotherhood" with daily devotions + weekly live calls
8. **Physical events** — year 2+ · "Brotherhood Weekend" retreats ($299-499)
9. **Mentorship network** — year 2+ · vetted Christian mentors paired with seekers ($99-199/month)
10. **Sponsored content + brand partnerships** — last, only with aligned brands

## Key Differentiators (the Blue Ocean)

- **No corny church branding** — premium, cinematic, editorial aesthetic. Like Alo or Stoic, not like a youth group.
- **Direct masculine voice** — scripture-anchored sharpness. No soft seeker-sensitive language. No red-pill bro-talk either.
- **Brand precedes product (Yeezy / Essentials model)** — AI app + content + influencer trust come FIRST. Clothing comes LAST, after the brand is something people already want to wear. Neither Kanye nor Jerry Lorenzo led with a sneaker or a hoodie. We don't either.
- **The long-game loop** — months of daily AI app use builds real emotional bond. When clothing drops, people have been waiting for it. No hype needed.
- **Founder anonymity at launch** — it's a movement, not a personality cult. Founder steps out around month 12 (Ryan Holiday model).
- **No partisan politics** — sharp on culture, silent on parties. Maximum reach with minimum cancellation risk.

## Clothing Philosophy — Given, Not Gimmick

Clothing is the LAST thing FINDGOD ships, not the first. The brand must have already earned the right to be worn.

**When the first capsule drops (month 12-18), it must feel:**
- **Assumed, not announced** — people have been waiting, not surprised.
- **Quiet, not loud** — no "DROP 001" hype theater, no flashy campaigns, no limited-edition urgency.
- **Basics, not statement pieces** — heavyweight tee, hoodie, cap, crewneck. Nothing graphic-heavy.
- **Hidden scripture** — tiny reference on inside collar, inside sleeve, woven tag. Never a giant back hit.
- **Brand palette only** — no seasonal variations, no fashion-week drops.
- **A stranger sees it on the street and asks "what is that?"** — not "I know that brand."

If the brand doesn't yet feel like something men tattoo on themselves, the first hoodie is premature.

**References:**
- **Kanye / Yeezy** — was Kanye for a decade before his first sneaker. The brand equity preceded the product.
- **Jerry Lorenzo / Fear of God Essentials** — built Fear of God Main Line for years before Essentials dropped as the quieter accessible line.
- **Aimé Leon Dore** — brand came first, product followed. Feels inevitable, not manufactured.

## Current Priorities (Q2 2026)

Refined 2026-04-17. Clothing is explicitly NOT in the near-term priority list — it comes after the brand is earned.

1. **AI Bible Companion MVP live at findgod.com** — chat interface people can use immediately, gated behind free signup after first conversation
2. **Daily content engine live** — daily IG post, daily Daily Word email, consistent aesthetic
3. **Lock brand system** — pick final direction from /concepts/v3 variations, write brand-identity.md, apply across site
4. **Trademark + LLC** — form Wyoming/NM LLC (anonymity), file FINDGOD wordmark with USPTO under the LLC
5. **Fiverr/Upwork logo design brief** — send all 3 logo directions (shield, cross+blade, gate) to 3 designers, pick winner
6. **DNS: point findgod.com at Vercel** — update GoDaddy records (currently pointing to stale Shopify)

## Memory Crash Precedent (2026-04-14)

A stray `~/package-lock.json` in the home folder caused Next.js to watch the entire home directory tree, ballooning memory to 70+ GB and crashing the computer twice. The stray file was deleted. **Never re-create it.** If Next.js complains about lockfile inference, fix via `next.config.ts`, not by adding a stray lockfile.
