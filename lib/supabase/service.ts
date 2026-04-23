import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

/**
 * Service-role Supabase client for server-only writes to tables that are
 * locked down by RLS (messages, events, prompt_versions, personality_config,
 * feature_flags). Never expose this to the browser — it bypasses all RLS.
 *
 * Memoized at module scope so each warm Fluid Compute instance builds the
 * supabase-js client exactly once (saves ~20–40ms of GoTrue + PostgREST
 * sub-client instantiation per chat turn, since the chat route does 3–5
 * insert/read calls). Safe because:
 *   - service-role auth is stateless (no session rotation)
 *   - persistSession: false means no cookie coupling
 *   - the client isn't request-scoped anywhere else in the codebase
 */

let _client: SupabaseClient | null = null;

export function createServiceClient(): SupabaseClient {
  if (_client) return _client;
  _client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
  return _client;
}
