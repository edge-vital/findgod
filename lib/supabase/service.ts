import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for server-only writes to tables that are
 * locked down by RLS (messages, events, prompt_versions). Never expose
 * this to the browser — it bypasses all row-level security.
 *
 * Used by the admin dashboard and by request-scoped code in the main app
 * that needs to persist analytics/chat data that authenticated + anon
 * users otherwise can't touch.
 *
 * Fresh client per call is fine — the underlying supabase-js keeps its
 * own connection pool.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
