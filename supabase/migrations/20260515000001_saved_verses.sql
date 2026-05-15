-- ═══════════════════════════════════════════════════════════════════════
-- FINDGOD — saved_verses
-- ═══════════════════════════════════════════════════════════════════════
-- Per-user scripture bookmarks. Lets an authenticated user "save" a verse
-- they encountered in the chat (or via the Today's Word card) so it shows
-- up in their Saved drawer later.
--
-- WHY: retention layer. Users come back tomorrow to revisit verses that
-- landed. Without persistence, every visit is one-and-done.
--
-- ACCESS MODEL:
--   - RLS enabled.
--   - SELECT / INSERT / DELETE policies all scoped to auth.uid() = user_id.
--   - No service-role-only restriction here (unlike messages) — the user
--     IS the consumer of their own bookmarks, so direct authenticated
--     access from the browser via supabase-js would be acceptable.
--   - Today we go through server actions anyway (cleaner audit trail).
--
-- IDEMPOTENT: created `if not exists`; safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.saved_verses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  -- Canonical reference string. Matches the keys in lib/todays-verse.ts
  -- for the curated 33-verse set today; future expansion (M4) will widen
  -- this to any verse the AI ever quotes.
  verse_ref   text not null,
  -- Verse body — denormalized snapshot at save time so users always see
  -- the exact wording they bookmarked even if a future translation pass
  -- changes the curated list.
  verse_text  text not null,
  saved_at    timestamptz not null default now(),

  -- One save per (user, verse). Re-saving is a no-op via ON CONFLICT.
  unique (user_id, verse_ref)
);

create index if not exists saved_verses_user_id_saved_at_idx
  on public.saved_verses (user_id, saved_at desc);

alter table public.saved_verses enable row level security;

-- A user can see only their own bookmarks.
drop policy if exists "saved_verses select own" on public.saved_verses;
create policy "saved_verses select own"
  on public.saved_verses
  for select
  to authenticated
  using (auth.uid() = user_id);

-- A user can insert only rows where they own the user_id.
drop policy if exists "saved_verses insert own" on public.saved_verses;
create policy "saved_verses insert own"
  on public.saved_verses
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- A user can delete only their own bookmarks.
drop policy if exists "saved_verses delete own" on public.saved_verses;
create policy "saved_verses delete own"
  on public.saved_verses
  for delete
  to authenticated
  using (auth.uid() = user_id);

comment on table public.saved_verses is
  'Per-user scripture bookmarks. RLS-scoped to auth.uid().';
