# Coding Style Guide — FINDGOD

> Conventions for the Next.js site. Claude follows these when writing or editing code.

## General

- **TypeScript everywhere.** No plain `.js` files.
- **App Router only.** No Pages Router.
- **2-space indentation.** Enforced by Prettier defaults.
- **Double quotes** for strings (Next.js default).
- **Semicolons required.**
- **`const` over `let`.** Never `var`.

## React

- **Server Components by default.** Add `"use client"` only when interactivity is required (state, event handlers, browser APIs).
- **No CSS-in-JS libraries.** Tailwind CSS 4 only.
- **Use `next/image`, `next/font`, and `next/link`** — never raw `<img>`, external font imports, or `<a>` for internal navigation.
- **Server Actions for forms.** Wire forms via `action={serverAction}`. Use `useActionState` for pending/success/error states.

## Naming

- **Components:** PascalCase (`SignupForm`)
- **Files:** kebab-case (`signup-form.tsx`)
- **Functions and variables:** camelCase (`subscribeToDailyWord`)
- **Server actions files:** `actions.ts` colocated with the route or feature
- **Constants:** UPPER_SNAKE_CASE

## File Organization

- **All app code lives in `app/`.** No `src/` directory.
- **Colocate components** with the route that uses them when possible.
- **Reusable UI** goes in `components/`.
- **Utilities** go in `lib/`.
- **Server actions** colocated with the feature, named `actions.ts`.

## Tailwind

- **Use theme tokens** from `globals.css` — `bg-background`, `text-foreground`, `border-border` — not raw colors when a token exists.
- **Avoid arbitrary values** unless absolutely necessary.
- **Mobile-first.** Default styles are mobile, then `sm:`, `md:`, `lg:` for larger screens.
- **Match the brand aesthetic:** dark, moody, cinematic. Black backgrounds. Muted earth tones. Editorial spacing. No bright/saturated colors except rare gold accents.

## Comments

- Only add comments where the logic isn't obvious.
- Don't add comments that just repeat what the code says.
- Use `// TODO:` for known issues or future work.

## Environment Variables

- Never commit `.env.local` or any file with real secrets.
- Always update `.env.local.example` when adding a new env var.
- Server-side only env vars: `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`
- Client-exposed env vars must be prefixed with `NEXT_PUBLIC_` (e.g. `NEXT_PUBLIC_SITE_URL`)

## Performance

- **Use `next/image`** for all images. Provide `width`, `height`, and `alt`.
- **Mark above-the-fold images with `priority`** so they load first.
- **Use `next/font`** for all fonts. Never link to Google Fonts via `<link>` tags.
- **Avoid client-side data fetching** when a Server Component could do it on the server instead.

## Accessibility

- **Every form input needs a label** (visible or via `aria-label`).
- **Every image needs `alt` text** (use `alt=""` for decorative images).
- **Every interactive element must be keyboard-accessible.**
- **Use semantic HTML** (`<button>`, `<nav>`, `<main>`, `<footer>`) — not `<div>` for everything.
