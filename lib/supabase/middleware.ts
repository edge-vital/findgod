import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresh the Supabase auth session on every incoming request.
 *
 * This runs inside proxy.ts (Next.js 16's middleware replacement). Without
 * it, expired access tokens are not refreshed and users silently log out.
 *
 * The function reads incoming cookies, passes them to Supabase, and writes
 * any refreshed cookies back to the outgoing response.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Touch the session so any rotated tokens flow into cookiesToSet above.
  // IMPORTANT: do not remove this — session refresh depends on it.
  await supabase.auth.getUser();

  return response;
}
