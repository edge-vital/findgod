-- Rate-limit attempt log shared by:
--   - main repo OTP request/verify (per-email, per-IP)
--   - admin repo OTP request/verify (per-email, per-IP)
--   - admin repo Examples save (per-admin-id)
--
-- Each accepted/attempted action inserts a row. Helpers in
-- lib/rate-limit.ts query the rolling window before allowing the next
-- attempt and reject when the count exceeds the configured cap.
--
-- bucket_key is opaque to the DB — caller chooses the namespace
-- ("email:foo@bar.com", "ip:1.2.3.4", "admin:<uuid>").
-- attempt_type is also opaque ("otp_request", "otp_verify",
-- "examples_save", etc.).
--
-- A pg_cron-driven nightly cleanup keeps the table small. We don't
-- enforce RLS here — only service-role writes/reads, and the row data
-- is non-sensitive (email + IP only on the bucket_key column).

create table if not exists public.auth_rate_limits (
  id bigserial primary key,
  bucket_key text not null,
  attempt_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists auth_rate_limits_bucket_type_created_idx
  on public.auth_rate_limits (bucket_key, attempt_type, created_at desc);

-- Service-role-only access (RLS deny everyone, no policies).
alter table public.auth_rate_limits enable row level security;

-- Nightly cleanup: rows older than 7 days are useless (longest configured
-- window is 1h per bucket; 7 days gives audit headroom). Uses pg_cron
-- which is available on Supabase.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'prune_auth_rate_limits',
      '0 3 * * *',
      $cron$
        delete from public.auth_rate_limits
        where created_at < now() - interval '7 days';
      $cron$
    );
  end if;
end $$;
