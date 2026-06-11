# FINDGOD — UX/UI "Wow" Plan

> From three deep-dive audits (visual craft · chat product · flow/mobile), 2026-05-28.
> Goal: make findgod.com feel hand-built and reverent (a movement, not another AI chatbot)
> AND stop the two places it quietly loses people.
> Every item has exact file + line references in the audit; build on command.

**Headline:** the bones are good. All three audits independently said FINDGOD is already
above generic-AI baseline (Georgia-italic scripture, 888 pulse instead of a spinner, no
avatar circles, no emoji, solid a11y plumbing). The gap to "wow / clearly custom" is a
short list of specific tells + two real bugs underneath.

Recommended order: **Phase 0 → Phase 1 → Phase 3 (scripture-arrives) → Phase 2.**
Confirm with Jones after each phase.

---

## Phase 0 — Fix what's actually broken (DO FIRST)

> **✅ SHIPPED 2026-06-11** (commit `068d83a`): 0.1 and 0.3 fully done; 0.2 partially —
> mid-conversation walls keep the thread visible, and returning visitors now get brand
> context + Today's Word above the wall instead of a bare paywall card.
> Phases 1–3 below are NOT started.

**0.1 — The invisible wall.** Server returns 402 (anon limit) / 429 (daily cap) but the
client has no error handler — user sees only red "That didn't land. Try again." and retries
into a wall they can't see. The gentle "come back tomorrow" copy exists server-side but
never reaches the user.
- File: `app/chat-interface.tsx` (no onError on useChat)
- Check: hit the limit → reliably see the wall (or calm "come back tomorrow" card), never a red retry loop.

**0.2 — Signup wall deletes the conversation it's asking you to commit to.** Wall *replaces*
the whole chat; returning visitors land on a bare paywall card with the thread gone.
- Files: `app/chat-interface.tsx`, `app/chat/signup-blocker.tsx`
- Check: when the wall appears, the conversation is still visible above it.

**0.3 — Mobile foundation missing (90% of visitors).** No `viewport-fit=cover`, no
`themeColor`, composer sits under the iPhone home bar, `100vh` makes the hero jump.
- Files: `app/layout.tsx`, `app/page.tsx`, `app/chat-interface.tsx`, `app/globals.css`
- Check: on a real iPhone — dark bar matches page, send button clears home bar, hero doesn't jump.

---

## Phase 1 — Quick wins bundle (each ≤30 min)

1.1 — F-Cross as the send button (replace generic ↑ arrow) — `chat-interface.tsx` + `components/f-cross.tsx`
1.2 — Kill the red error → bone/gold — `chat-interface.tsx`, `signup-form.tsx`
1.3 — De-pill buttons & inputs (`rounded-full` → squared) — `signup-form.tsx`, `chat-interface.tsx`
1.4 — Bone CTA not pure white (`bg-white` → `#F0EDE6`) — `signup-form.tsx`
1.5 — Warm the cursor glow (white → gold tint) — `cursor-spotlight.tsx`
1.6 — Strengthen inscription divider (longer, less faint) — `inscription-divider.tsx`
1.7 — Voice carries on follow-up ("Your reply…" → rotating in-voice prompts) — `chat-interface.tsx`
1.8 — Tap targets ≥44px, drop stale font token, fix "Loading…"/raw ✕ — top-bar, drawers, `globals.css`

---

## Phase 2 — Bigger structural moves

2.1 — Unbox the AI message (remove gray bubble; sit on void w/ gold left-rule) — `app/chat/message-bubble.tsx` · ~1 day
2.2 — Lighten + de-risk signup wall: trim value list, only show SMS/TCPA consent once phone typed — `signup-form.tsx` · ~half day
2.3 — One calm verse action, not two stacked buttons — `components/markdown-message.tsx` · ~half day
2.4 — Companion presence in empty state (reads as search box now) — `chat-interface.tsx`, `app/chat/greetings.tsx` · ~half day
2.5 — OTP polish + resume last conversation — `signup-form.tsx`, `actions.ts`, `chat-interface.tsx` · ~half day
2.6 — A11y pass (focus-trap drawers, announce wall, consent contrast/TCPA) · ~half day

---

## Phase 3 — Signature moments (screenshot-makers; pick one to start)

- **Scripture arrives (chat)** — verse is *delivered* not streamed: room dims a beat, Georgia
  italic fades up behind a soft gold wash, inscription breathing above/below. Embodies "let
  scripture say the hard thing." Most parts already exist. **Recommended first.** ~1–2 days
- **Self-tracing seal (landing)** — on first input focus, a hairline traces clockwise around
  the field like a seal being drawn, once per session. ~1–2 days

---

## Needle-movers
Phases 0.2 + 2.2 + 0.3 are the conversion levers. Phase 0 alone is a meaningful improvement.
