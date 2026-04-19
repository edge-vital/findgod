-- ═══════════════════════════════════════════════════════════════════════
-- FINDGOD Admin Dashboard — initial schema
-- ═══════════════════════════════════════════════════════════════════════
-- Creates three tables the new admin.findgod.com dashboard will read from:
--
--   messages         — every user + assistant chat turn (90-day TTL)
--   events           — funnel events: landed / first_message / hit_wall / signed_up
--   prompt_versions  — historical + active AI system prompts (edited via dashboard)
--
-- All three are SERVICE-ROLE ONLY. No RLS policies for authenticated or anon —
-- the public chat client never reads these tables directly. The admin dashboard
-- always queries via a server-side client using SUPABASE_SERVICE_ROLE_KEY.
--
-- Auditable: this file is version-controlled alongside the code that writes to
-- these tables. Future schema changes go into new migration files, never in-place.
-- ═══════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────
-- messages
-- ───────────────────────────────────────────────────────────────────────
-- Every user message + AI response, grouped into conversations.
--
-- session_id is the same signed cookie value that lib/chat-limit.ts uses for
-- the free-chat wall (so anonymous chats are linkable across messages before
-- a user signs up). After a user signs up, user_id is backfilled on their
-- historical rows so their past conversations attach to their account.
--
-- content is raw text (not JSON). role is 'user' | 'assistant'.
-- ───────────────────────────────────────────────────────────────────────

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  session_id      text not null,
  user_id         uuid references auth.users (id) on delete set null,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  created_at      timestamptz not null default now()
);

create index if not exists messages_session_id_idx       on public.messages (session_id);
create index if not exists messages_user_id_idx          on public.messages (user_id);
create index if not exists messages_conversation_id_idx  on public.messages (conversation_id);
create index if not exists messages_created_at_idx       on public.messages (created_at desc);

alter table public.messages enable row level security;
-- No policies = no access for anon or authenticated roles.
-- Service role bypasses RLS by design, so admin queries still work.

comment on table public.messages is
  'Chat transcript. Service-role only. 90-day TTL via scheduled job below.';


-- ───────────────────────────────────────────────────────────────────────
-- events
-- ───────────────────────────────────────────────────────────────────────
-- Lightweight funnel tracking. One row per event fired from the main app.
--
-- event_type values:
--   landed         — page view on /
--   first_message  — a session sent its first message to /api/chat
--   hit_wall       — the anonymous chat limit was reached (signup wall shown)
--   signed_up      — OTP verified successfully
--
-- metadata is free-form JSON for whatever extra context the event emitter adds.
-- ───────────────────────────────────────────────────────────────────────

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  event_type  text not null check (event_type in ('landed', 'first_message', 'hit_wall', 'signed_up')),
  session_id  text not null,
  user_id     uuid references auth.users (id) on delete set null,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists events_event_type_created_at_idx  on public.events (event_type, created_at desc);
create index if not exists events_session_id_idx             on public.events (session_id);
create index if not exists events_user_id_idx                on public.events (user_id);

alter table public.events enable row level security;

comment on table public.events is
  'Funnel events (landed / first_message / hit_wall / signed_up). Service-role only.';


-- ───────────────────────────────────────────────────────────────────────
-- prompt_versions
-- ───────────────────────────────────────────────────────────────────────
-- One row per saved version of the AI system prompt. Exactly ONE row may have
-- is_active = true at a time (enforced by a partial unique index).
--
-- sections is the structured form data from the dashboard:
--   {
--     "tone": "...",
--     "always_do": ["...", "..."],
--     "never_do": ["...", "..."],
--     "example_response": "...",
--     "topics_to_avoid": ["..."]
--   }
--
-- raw_override is an optional free-text override Jones can edit in the "Advanced"
-- tab. If set, it's appended/replaced into the compiled prompt.
--
-- compiled_text is the final string that actually gets sent to Claude.
-- It's also mirrored to Vercel Edge Config on publish for fast reads from
-- the chat route — this table remains the source of truth for history + drafts.
--
-- created_by references auth.users to track which admin saved the version.
-- ───────────────────────────────────────────────────────────────────────

create table if not exists public.prompt_versions (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  sections        jsonb not null default '{}'::jsonb,
  raw_override    text,
  compiled_text   text not null,
  is_active       boolean not null default false,
  created_by      uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists prompt_versions_is_active_idx on public.prompt_versions (is_active) where is_active = true;
create unique index if not exists prompt_versions_one_active_idx on public.prompt_versions ((is_active)) where is_active = true;
create index if not exists prompt_versions_created_at_idx on public.prompt_versions (created_at desc);

alter table public.prompt_versions enable row level security;

comment on table public.prompt_versions is
  'Historical AI system prompts. Exactly one row may be is_active=true. Service-role only.';


-- ───────────────────────────────────────────────────────────────────────
-- 90-day TTL on messages
-- ───────────────────────────────────────────────────────────────────────
-- Chat messages contain sensitive-category data (spiritual + mental health).
-- We keep 90 days for debugging + pattern analysis, then delete.
--
-- Uses pg_cron — if this extension isn't yet enabled, run:
--   create extension if not exists pg_cron;
-- in the Supabase dashboard (Database → Extensions). Free tier supports pg_cron.
-- ───────────────────────────────────────────────────────────────────────

create extension if not exists pg_cron;

-- Drop any previous job with this name so this migration is re-runnable.
do $$
begin
  perform cron.unschedule(jobid)
  from cron.job
  where jobname = 'findgod_messages_ttl';
exception when others then
  null; -- pg_cron unavailable or job didn't exist; safe to ignore
end;
$$;

select cron.schedule(
  'findgod_messages_ttl',
  '0 3 * * *',  -- daily at 3 AM UTC
  $$delete from public.messages where created_at < now() - interval '90 days'$$
);
