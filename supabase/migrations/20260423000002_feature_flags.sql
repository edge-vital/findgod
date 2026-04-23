-- ═══════════════════════════════════════════════════════════════════════
-- Feature flags — runtime kill switches for the AI Training 2.0 compiler
-- ═══════════════════════════════════════════════════════════════════════
-- One row per toggle. Read by `lib/feature-flags.ts` in the main app with
-- the same 60s in-memory cache pattern as `lib/active-system-prompt.ts`.
--
-- Intent: if the prompt compiler or any stage misbehaves in production,
-- we can disable it by flipping a boolean — no redeploy required.
-- Propagation is at most 60s per warm instance (cache TTL).
--
-- Fails OPEN: if Supabase is unreachable, the main app treats all flags
-- as enabled (preserves pre-compiler behavior). If an explicit `false`
-- can't be read, we want the app to keep running, not to silently disable
-- features.
--
-- Service-role only. Admin dashboard writes to this table via a future
-- Block 4 toggle UI. Until that UI ships, Jones toggles via Supabase SQL
-- editor: `update feature_flags set enabled = false where key = '…';`
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.feature_flags (
  key          text primary key,
  enabled      boolean not null default true,
  description  text,
  updated_at   timestamptz not null default now()
);

alter table public.feature_flags enable row level security;

comment on table public.feature_flags is
  'Runtime kill switches for AI Training 2.0 stages. Service-role only.';

-- Seed the 5 flags the compiler reads. ON CONFLICT keeps the migration
-- re-runnable if Jones edits values between runs.
insert into public.feature_flags (key, enabled, description) values
  ('compiler_v2_enabled',
   true,
   'Master switch for the prompt compiler. OFF = chat route falls back to the legacy getActiveSystemPrompt() path, bypassing all stages.'),
  ('stage_personality_enabled',
   true,
   'Append the structured personality config (tone/voice/dos/donts/style) to every chat prompt.'),
  ('stage_examples_enabled',
   true,
   'Inject the top-N matched few-shot example responses (Milestone 2).'),
  ('stage_guardrails_enabled',
   true,
   'Append topic-triggered guardrail directives (Milestone 3).'),
  ('stage_knowledge_enabled',
   true,
   'Retrieve and inject top-K knowledge chunks via pgvector (Milestone 4).')
on conflict (key) do nothing;
