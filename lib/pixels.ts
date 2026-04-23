import { createServiceClient } from "./supabase/service";

/**
 * Resolves the currently-enabled tracking pixels for findgod.com.
 *
 * Admins configure pixel IDs via admin.findgod.com/pixels; that writes
 * to the `pixel_settings` table. The public site reads from the same
 * table here (via service role — the table is service-role-only by
 * RLS) and renders the corresponding tracking scripts in `<body>`.
 *
 * Per-instance in-memory cache with 5-minute TTL so we don't hit
 * Supabase on every page render. Admin changes propagate within
 * ~5 minutes (or instantly on a cold-started function).
 *
 * When Supabase is unreachable or returns no rows we return an empty
 * array — the layout renders zero script tags and the page behaves
 * exactly as it did before pixels existed.
 */

export type PixelProvider = "meta" | "ga4" | "tiktok";

export type EnabledPixel = {
  provider: PixelProvider;
  pixelId: string;
};

const CACHE_TTL_MS = 5 * 60_000;
let cache: { value: EnabledPixel[]; fetchedAt: number } | null = null;

export async function getEnabledPixels(): Promise<EnabledPixel[]> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) return cache.value;

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("pixel_settings")
      .select("provider, pixel_id, enabled")
      .eq("enabled", true);

    if (error) {
      // Log error.code only — PostgREST error.message can include the
      // offending row's values on constraint violations.
      console.error("[findgod/pixels] read error:", error.code ?? "unknown");
      return cache?.value ?? [];
    }

    const enabled = (data ?? [])
      .filter(
        (r): r is { provider: PixelProvider; pixel_id: string; enabled: boolean } =>
          !!r.pixel_id && isProvider(r.provider),
      )
      .map((r) => ({ provider: r.provider, pixelId: r.pixel_id }));

    cache = { value: enabled, fetchedAt: now };
    return enabled;
  } catch (e) {
    console.error(
      "[findgod/pixels] unexpected:",
      e instanceof Error ? `${e.name}: ${e.message}` : "unknown",
    );
    return cache?.value ?? [];
  }
}

function isProvider(raw: string | null | undefined): raw is PixelProvider {
  return raw === "meta" || raw === "ga4" || raw === "tiktok";
}
