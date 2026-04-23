-- ═══════════════════════════════════════════════════════════════════════
-- FINDGOD — pixel_settings table
-- ═══════════════════════════════════════════════════════════════════════
-- One row per tracking-pixel provider. The main findgod.com app reads
-- this table on page render and injects the corresponding tracking
-- script into <body> when `enabled = true` AND `pixel_id` is non-null.
--
-- Service-role only. Admins manage values via admin.findgod.com/pixels;
-- the public site never queries this table from the client.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.pixel_settings (
  provider    text primary key
              check (provider in ('meta', 'ga4', 'tiktok')),
  pixel_id    text,
  enabled     boolean not null default false,
  updated_by  uuid references auth.users (id) on delete set null,
  updated_at  timestamptz not null default now()
);

-- Seed a row for each supported provider so the admin UI can render
-- three cards without having to handle the "row doesn't exist" state.
insert into public.pixel_settings (provider)
  values ('meta'), ('ga4'), ('tiktok')
  on conflict (provider) do nothing;

alter table public.pixel_settings enable row level security;
-- No policies = service-role only, same pattern as messages / events /
-- prompt_versions. Public site + admin dashboard both use the service
-- client to read/write.

comment on table public.pixel_settings is
  'Tracking-pixel IDs (Meta / GA4 / TikTok) injected into findgod.com <body> when enabled. Service-role only.';
