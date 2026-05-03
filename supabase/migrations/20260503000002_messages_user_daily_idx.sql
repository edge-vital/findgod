-- Composite index supporting the H-3 per-user daily message budget
-- query in app/api/chat/route.ts:
--
--   from messages
--   where user_id = $1 and role = 'user' and created_at >= now() - 24h
--
-- The single-column indexes on (user_id) and (created_at) shipped in
-- the original schema (20260419000001) require Postgres to choose one
-- index then filter. At small scale this is fine. At scale (millions of
-- rows, heavy users) it becomes an index scan + filter rather than an
-- index-only range scan — and a slow query holding a connection during
-- a flood is itself a DOS vector.
--
-- This partial covering index targets the EXACT predicate so a count
-- query becomes index-only.
--
-- Safe to re-run: `if not exists` guards the create.

create index if not exists messages_user_role_created_idx
  on public.messages (user_id, created_at desc)
  where role = 'user';
