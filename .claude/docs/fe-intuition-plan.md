# FE Intuition Deep-Dive — Consolidated Plan

> 3-agent parallel research findings (UX friction / brand fit / industry benchmarks).
> Saved 2026-05-03. Status: **PLAN ONLY — nothing built yet.**

---

## Diagnosis (where the "feels basic" complaint lives)

The page sets up a cathedral and puts a Best Buy kiosk in the middle.

The bones are FINDGOD: wordmark, inscription divider (`ΙΗΣΟΥΣ ≡ 888`), Georgia italic scripture, gold caret, the pulsing 888 thinking indicator, the WRESTLE / HEAL / BEGIN chips. **All on-brand.**

The center surfaces — **white iMessage-style user bubble**, **generic pill input with circular up-arrow send button**, **composer that scrolls off-screen mid-conversation**, **bare empty state**, **no daily reason to return** — are what feel basic.

---

## Where all three agents agreed

1. **The white user bubble is the single biggest brand violation.** Brand identity: "black is the home." Replace with bone-tinted block or deep-jet card with thin gold edge.
2. **Composer scrolls off-screen.** No serious app does this. Pin to bottom of viewport.
3. **No daily ritual hook.** Hallow has dated "Today's" card. Stoic has Morning + Evening. Calm has Daily Calm. FINDGOD has nothing in-app — biggest retention gap.
4. **Starter prompts + choice-block UX ARE the moat.** Three independent agents called these out as genuinely unique vs. ChatGPT / Bible Chat. Keep + double down.
5. **Scripture verse refs not getting brand-promised reverence.** Should render in JetBrains Mono uppercase letterspaced on its own line, separated from the verse.

---

## The plan, ranked by impact

### Tier 1 — "Feels basic" killers (ship first)

| # | Change | What done looks like | Effort |
|---|---|---|---|
| 1 | Kill the white user bubble — replace with bone-tinted right-aligned block, or deep-jet card with thin gold edge | Send a message → words appear in FINDGOD type, no white pill | XS |
| 2 | Sticky bottom composer + thin top bar (FINDGOD wordmark + "New chat" button) | Scroll long thread → input always reachable; visible compass at top | S |
| 3 | One-line product tagline above input on first paint (`AI BIBLE COMPANION · ASK ANYTHING · ANSWERED IN SCRIPTURE`) | First-time visitor knows what this is in 2 seconds | XS |

### Tier 2 — Brand reverence

| # | Change | Effort |
|---|---|---|
| 4 | Promote scripture verse refs to JetBrains Mono uppercase letterspaced (e.g. `1 CORINTHIANS 16:13 (ESV)` on its own line) | S |
| 5 | Replace generic send-arrow with F-Cross (CM03) mark | S |
| 6 | 888 Seal small (~20px) next to every AI response — every answer "signed" | S |
| 7 | Style markdown bold as Archivo Black uppercase | XS |
| 8 | More breathing room around scripture quotes; verse ref fades in after streaming | M |

### Tier 3 — Engagement / retention layer

| # | Change | Effort |
|---|---|---|
| 9 | Dated "Today's Word" card on empty state | M |
| 10 | Save-the-verse + Saved tab for authenticated users | M |
| 11 | Conversation history (drawer desktop, sheet mobile) | M |
| 12 | Multiline textarea + voice input button | M |
| 13 | Soft "X messages left before sign-in" counter instead of hard wall | XS |
| 14 | Gentle streaks — no red, no shame ("12 days into the path") | M |

### Tier 4 — Micro-rituals

- Send confirmation: 60ms scale-down + soft gold flash ("thunk")
- Subtle "Thinking…" word fading in below inscription on first turn
- Tighten promise pillars line under input to JetBrains Mono

---

## Anti-patterns to actively avoid

1. **Replika-style parasocial dependency.** Product points past itself to Christ. If users grieve a feature change, FINDGOD has failed its purpose.
2. **"ChatGPT in a Christian skin" (Bible Chat trap).** Without scripture-aware formatting + theological depth + distinct voice, FINDGOD = $5/wk skin. Reviewers smell this instantly.
3. **Bento-grid fragmentation (late-2025 Calm/Headspace mistake).** Don't give 12 entry points. The chat IS the home.
4. **Replika repetition collapse + memory failures.** Don't ship "save the verse" until memory durable.
5. **Pray.com / Bible-Chat aggressive paywall friction.**

---

## Recommended ship order (if only 3 things)

**#1 + #2 + #9** — kill white bubble, sticky composer + top bar, dated Today's Word card.

That trio addresses all three roots of the "feels basic" complaint: surface where user lives (#1), structure that makes it an app (#2), reason to come back tomorrow (#9). Effort: XS + S + M ≈ ~1.5 days work if Daily Word email content can be reused.

Tier 2 stacks cleanly on top once Tier 1 lands.
Tier 3 best done as part of M4 (auth/persistence overlap).

---

## Open questions for Jones

- Approve the ranked plan as-is, or push back on any tier?
- Pre-build click-prototype mockups before code, or go straight to build?
- Sequencing: M4 Knowledge build first vs. Tier 1 FE polish first vs. interleave?
