import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Call from client components when you need
 * reactive auth state (sign out, current user on render, etc.). For server
 * actions and route handlers use `lib/supabase/server.ts`.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
