import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 16 routing middleware (proxy.ts).
 *
 * Runs before every matching request. Refreshes the Supabase auth session
 * so expired access tokens are rotated automatically and users stay logged
 * in without manual reload. See `lib/supabase/middleware.ts` for the
 * session-refresh logic.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Skip Next internals, common static assets, and our icon SVGs. Anything
    // else (pages, API routes, server actions) passes through updateSession.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
