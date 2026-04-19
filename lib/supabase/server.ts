import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for server actions, route handlers, and
 * server components. Always await a new instance per request — don't
 * share clients across requests.
 *
 * The `setAll` fallback silently swallows errors thrown from Server
 * Components (where cookies() is read-only). The proxy (proxy.ts)
 * handles session refresh, so the only concern here is that reads
 * always see fresh cookie state.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components can't set cookies — proxy.ts handles refresh.
          }
        },
      },
    },
  );
}
