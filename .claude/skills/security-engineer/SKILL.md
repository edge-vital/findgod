---
name: security-engineer
description: Dedicated security engineer for the FINDGOD project. Threat-models and reviews any code, config, infrastructure, API, CI/CD, or deployment work for vulnerabilities before implementation. Performs risk-scaled security analysis — from a one-line sign-off on safe changes to full OWASP-mapped threat models on auth, data handling, and API boundary work. Use this skill whenever the user asks to "security review," "threat model," "check for vulnerabilities," "audit this code," "is this secure," "pentest this," "harden this," or any request involving security analysis, secure code review, vulnerability assessment, attack surface mapping, or compliance checking. Also triggers on "check for injection," "secrets exposure," "access control review," "OWASP check," "CWE check," "agentic AI security," "MCP security," or when the user wants a security-first perspective on any technical decision.
---

# FINDGOD — Security Engineer (project-local pointer)

This is a discovery stub that registers the Security Engineer skill as endorsed for this project. The full skill implementation lives upstream at the user level as `anthropic-skills:security-engineer`.

## How to use this skill

When a Security Engineer review is needed on the FINDGOD project:

1. Prefer calling the upstream skill via the Skill tool: `Skill(skill="anthropic-skills:security-engineer", args="…")`.
2. If the upstream skill is not available, fall back to running a manual OWASP-mapped threat model against the change set — focus on the FINDGOD attack surface below.

## FINDGOD-specific attack surface to check

- **Vercel AI Gateway / OIDC token flow** (`app/api/chat/route.ts`) — ensure no token leakage to the client, no prompt-injection passthrough to the model, no unbounded retry loops.
- **AI chat input** (`app/chat-interface.tsx`) — user messages flow to the AI; verify safeguards against crisis escalation already hardcoded in `lib/findgod-system-prompt.ts` are not bypassed by new code paths.
- **Email capture** (`app/signup-form.tsx`, `app/actions.ts`) — validate Beehiiv env vars are never exposed client-side; signup action is server-action-only; no PII logged to server console once Beehiiv is wired up.
- **Supabase + Stripe** (future Phase B) — when chat persistence and premium tier ship, full auth review + row-level security audit + Stripe webhook signature verification.
- **Markdown rendering** (`react-markdown` in chat) — verify no XSS via untrusted markdown; scripture blockquotes must not accept raw HTML.
- **`.env` hygiene** — never commit `.env.local`; `.env.local.example` stays in sync; no secret ever lands in git history.

## Trigger words specific to FINDGOD

Invoke this skill when the user mentions:
- "security review" / "audit" / "is this safe?"
- "before we deploy" — any production deploy that touches chat, auth, or payments
- "Beehiiv" / "Supabase" / "Stripe" — the three external integrations with the largest blast radius
- New API routes, server actions, or middleware
- Any change that reads, writes, or forwards user input to an external API
