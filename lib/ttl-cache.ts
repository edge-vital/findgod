/**
 * Per-instance TTL cache with in-flight dedupe. Used by the three
 * runtime helpers that read admin-editable Supabase rows on every chat
 * turn (`active-system-prompt`, `personality-stage`, `feature-flags`)
 * to keep Supabase load at ~1 read/minute per warm Fluid Compute
 * instance, with thundering-herd protection on cache misses.
 *
 * Design:
 *   - Module-scoped cache per consumer (each consumer calls `makeCache`
 *     once at module load).
 *   - Success caches the value with a `fetchedAt` stamp; subsequent
 *     reads return it until TTL expiry.
 *   - Errors intentionally do NOT cache — the next request retries.
 *     This prevents a single transient Supabase blip from silently
 *     disabling the feature for 60s (the bug Block 1 fixed).
 *   - An in-flight promise dedupes concurrent cache misses so N
 *     concurrent requests trigger exactly one Supabase read.
 *
 * Caller is responsible for the fallback value on error — the returned
 * `get()` resolves to `undefined` if the fetcher throws.
 */

export type TtlCache<T> = {
  get: () => Promise<T | undefined>;
  invalidate: () => void;
};

export type MakeCacheOptions<T> = {
  /** Function that performs the actual fetch. Thrown errors are logged and surfaced as undefined. */
  fetcher: () => Promise<T>;
  /** Milliseconds to cache a successful fetch. */
  ttlMs: number;
  /** Tag used in error logs (e.g. "findgod/personality-stage"). */
  label: string;
  /**
   * Optional predicate: return false to skip caching this value even on
   * successful fetch. Use for "empty-means-use-fallback" cases where we
   * want to keep retrying Supabase in case the admin seeds a row.
   * Defaults to always-cache.
   */
  shouldCache?: (value: T) => boolean;
};

export function makeCache<T>({
  fetcher,
  ttlMs,
  label,
  shouldCache,
}: MakeCacheOptions<T>): TtlCache<T> {
  type Entry = { value: T; fetchedAt: number };

  let cache: Entry | null = null;
  let inFlight: Promise<T | undefined> | null = null;

  async function get(): Promise<T | undefined> {
    const now = Date.now();
    if (cache && now - cache.fetchedAt < ttlMs) {
      return cache.value;
    }

    if (inFlight) return inFlight;

    inFlight = (async () => {
      try {
        const value = await fetcher();
        if (!shouldCache || shouldCache(value)) {
          cache = { value, fetchedAt: Date.now() };
        }
        return value;
      } catch (e) {
        console.error(
          `[${label}] cache read failed, falling through:`,
          e instanceof Error ? `${e.name}: ${e.message}` : "unknown error",
        );
        // Intentionally do NOT cache on error — next request retries.
        return undefined;
      } finally {
        inFlight = null;
      }
    })();

    return inFlight;
  }

  function invalidate(): void {
    cache = null;
  }

  return { get, invalidate };
}
