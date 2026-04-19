# Brand Identity — FINDGOD

> The locked visual system. Claude reads this before making any visual / brand / marketing decision.
> Last updated: 2026-04-17

---

## The One-Line Positioning

> FINDGOD is the digital companion and streetwear brand for the man who's done with the noise. Scripture-anchored. Unapologetically direct. Always here.

---

## Wordmark

**FINDGOD — centered, all caps, Archivo Black, tight tracking.**

- Font: **Archivo Black** (weight 900)
- Letter-spacing: `-0.03em`
- Case: uppercase
- Alignment: centered by default; left-aligned only in small nav contexts
- Minimum size: 14px (never smaller — use the monogram instead)

**Reference layout:** `06A` from `/concepts/v3`.

---

## Monogram — THE STAMP

**888 — the isopsephy of Jesus.**

In ancient Greek gematria, the letters of **ΙΗΣΟΥΣ** (Iesous / Jesus) sum to exactly **888**. It's cited in the *Sibylline Oracles* (Book 1) and by Irenaeus in *Against Heresies* (c. 180 AD) as a divine marker of the name.

It's historical. It predates modern church branding. It rewards the curious. It's invisible to people who don't know, and a secret handshake for people who do.

### Primary monogram mark

**`M05B` — The 888 Seal.**

- Circle with a 3px border
- Inside: **888** in Archivo Black, ~96px on its own
- Caption inside the ring: **ΙΗΣΟΥΣ** in JetBrains Mono, uppercase, letter-spacing `0.4em`, size 9px, opacity 0.8
- Colors: bone (`#F0EDE6`) on jet black background; invertable

**Used for:**
- Favicon
- App icon
- Instagram avatar
- Hat embroidery (future)
- Chest patch / hang tag (future)
- Anywhere a mark stands alone at small sizes

### Hero monogram mark

**`M05A` — Hero Numerals.**

- **888** in Archivo Black, massive (clamp 120–220px)
- Flanked by baseline rules + Greek inscription: `— ΙΗΣΟΥΣ ≡ 888 —` in JetBrains Mono

**Used for:**
- Back prints on clothing (future)
- Splash screens
- Email banners
- Large-format marketing

### Compact Mark — `CM03` F-Cross

**`CM03` — The F-Cross.**

A single bold F where the horizontal arm extends past both sides of the vertical spine, forming a cross. The F vertical + extended top arm = a Christian cross. The F's middle arm is what identifies it as an F (the brand's first letter). The G is implied by FINDGOD context.

**SVG spec:**
- ViewBox `0 0 100 130`
- Cross horizontal: `<rect x="0" y="22" width="100" height="18" />`
- F vertical spine: `<rect x="38" y="0" width="18" height="130" />`
- F middle arm: `<rect x="38" y="62" width="46" height="14" />`
- Color: bone (`#F0EDE6`) on jet black background; invertable

**Used for:**
- Hat embroidery (chest patch when full wordmark won't fit)
- App icon (when the FINDGOD app launches, this can be the icon over the 888 seal for a more "personal" feel)
- Business cards (small mark in corner)
- Sticker / packaging tape (continuous repeat pattern)
- Tight nav contexts (mobile app bars, browser bookmark icon)
- Anywhere the brand's INITIAL needs to appear small but a circle seal would feel ceremonial

**Relationship to the 888 Seal (M05B):**
- **888 Seal** = the brand SIGNATURE. Ceremonial, historical, mysterious. Used in inscriptions, footer, AI loading state, favicon (current).
- **CM03 F-Cross** = the brand INITIAL. Practical, sculptural, instantly Christian. Used for product surfaces — hats, app icons, packaging.

Both are locked. They serve different jobs and never appear in the same composition.

### Rules

- **Wordmark leads. Monogram is the stamp.** Never use the monogram as the primary identifier on a page that hasn't already established the wordmark elsewhere (nav, header, previous post).
- **Never mix 888 with another Christian symbol** (cross, fish, etc.) in the same composition. The 888 is the symbol. Letting it stand alone is the point.
- **The Greek caption ΙΗΣΟΥΣ ≡ 888 is optional context, not required.** On a shirt chest hit, pure 888 is enough. On the first use in a piece of content, include the Greek so people learn.

### The ΙΗΣΟΥΣ ≡ 888 Inscription as a Divider

The full inscription `ΙΗΣΟΥΣ ≡ 888` is FINDGOD's section divider — used wherever a horizontal rule, separator, or section break would otherwise appear. Always rendered in JetBrains Mono, uppercase, letter-spacing `0.4em`, opacity `0.4–0.6`, often flanked by short horizontal hairlines.

**Currently used as a divider in:**
- Under the FINDGOD wordmark on the chat empty state (sits like a coat-of-arms motto)
- Between sections inside every AI chat response (replaces markdown `---`)
- In the signup wall (replaces the plain divider line)
- AI loading state — the inscription pulses softly while the AI is generating

**Future placements (not yet built):**
- **Instagram:** every post graphic gets the inscription stamp at the bottom or in a corner. Becomes the visual brotherhood signature across content.
- **Email (Beehiiv):** every Daily Word email closes with the inscription as the footer signature.
- **Print / merch:** seasonal lookbook page breaks, hang tag back, packaging tape.

**The rule:** anywhere FINDGOD content has a section break, replace it with the inscription. It becomes brand muscle memory after a few exposures.

---

## Color Palette

### Primary — "The Void"

| Name | Hex | Role |
|---|---|---|
| Jet | `#000000` | Primary background |
| Deep Jet | `#050507` | Live site background (slight lift) |
| Bone | `#F0EDE6` | Primary text on dark |
| Stone | `#8B8680` | Secondary text, muted UI |
| Gold (rare) | `#C4A87C` | Accent only — hover states, small details, scripture verse refs |

### Secondary / Seasonal — "The Daylight"

Used sparingly for editorial moments, lookbooks, and (eventually) seasonal apparel lookbook backgrounds. Never the primary site.

| Palette | Background | Text | Accent |
|---|---|---|---|
| Taupe Daylight | `#C9BDA9` | `#1A1814` (Ink) | `#4A3A2E` (Umber) |
| Charcoal + Bone | `#1F1C18` | `#E8E0CC` | `#C9BDA9` (Taupe) |
| Stone Paper | `#EFE8DA` | `#1A1814` (Ink) | `#4A3A2E` (Umber) |

### Rules

- **Black is the home.** If in doubt, use jet black.
- **Gold is a spice, not a staple.** Use for hover states and fine details only. Never for headlines or large surfaces.
- **No bright colors.** Ever. No reds, no blues, no corporate palette. The brand aesthetic is monastic, A24, Fear of God Essentials — not a church website.

---

## Typography System

### Display — `Archivo Black` (weight 900)

- Wordmark
- All section headlines
- Hero numerals (888)

### Body — `Inter` (weight 400/500)

- All running body copy
- Form inputs
- Navigation links
- Inline UI text

### Utility / Metadata — `JetBrains Mono` (regular)

- Small uppercase labels (`FINDGOD / V4`, `DAILY SCRIPTURE`, `EST. MMXXVI`)
- Scripture verse references (e.g., `1 CORINTHIANS 16:13 (ESV)`)
- Data / technical-feeling text
- Footer legal

### Scripture — System serif italic (Georgia)

**Scripture quotes render in Georgia italic** (system serif). CSS: `font-family: Georgia, 'Times New Roman', serif; font-style: italic;`.

- Always italic
- Always in a blockquote or visual container that sets it apart
- Verse reference below, in JetBrains Mono uppercase, letter-spacing `0.25em`

Why Georgia (not a custom web font): it's a workhorse system serif designed for screen reading. Reads warm, neutral, and reverent without the affectation of a custom italic display serif. Loads instantly (no font swap flicker). Won't fight with Archivo Black for visual attention. Tested EB Garamond — felt too decorative for the masculine, monastic voice.

### Font pairing rules

- **Never mix display and serif.** Archivo Black (display) and EB Garamond (scripture) are visually distinct roles and never appear in the same line.
- **Inter is the default.** If you don't know what font a piece of text should use, Inter is the answer.
- **Mono is for metadata only.** Never use JetBrains Mono for body copy or headlines.

---

## Voice (summary — full version in `brand-guidelines.md`)

> **"Let scripture say the hard thing. Apply it to real modern struggles. Never punch down. Never go partisan."**

- Short sentences
- Scripture quoted directly
- Modern idols named (phones, comfort, validation, followers)
- Masculine imagery (war, forge, battle, path, discipline)
- No corny Christian language ("blessed!", "real talk!", "fam")
- No partisan politics
- No emoji spam (rare 🕊️ or ✝️ maximum)

Target reader: the 16–30 year old man who is lost, anxious, and tired of the noise.

---

## The Three Guiding References

When making any visual decision, ask: *"Does this feel like…"*

1. **A monastery at 5 AM** — quiet, disciplined, ancient, spare.
2. **An A24 war film** — cinematic, moody, high-contrast, masculine.
3. **Fear of God Essentials** — premium, tonal, confident, no logos screaming.

If yes to all three: proceed.
If no: redesign.

---

## What's Still Open

- **Tagline:** deferred. "Strength · Wisdom · Brotherhood · Truth" is the current promise line in the footer but has not been officially locked as *the* tagline. Revisit after first month of live content.
- **Photography style:** not yet defined. Place-holder until real shoots. Reference mood: monastery photography, A24 film stills, dark editorial portraits.
- **Secondary mark variations:** M05B seal is locked for small; M05A hero is locked for large. No other variants approved.

---

## File References

- Visual exploration: `/app/concepts/v4/page.tsx` (5 monogram directions, 7 scripture types, all variations)
- Live site: `/app/page.tsx`, `/app/chat-interface.tsx`
- Voice rules: `.claude/rules/brand-guidelines.md`
- Code style: `.claude/rules/coding-style.md`
- Strategy: `.claude/docs/strategic-plan.md`

---

## Change Log

- **2026-04-17** — Initial lock. Wordmark 06A, monogram M05B + M05A (888 Isopsephy), scripture type T02 EB Garamond italic, primary palette jet black + bone + stone, secondary palettes taupe/charcoal/stone-paper. Tagline deferred.
