import { describe, expect, it, vi } from "vitest";
import { makeCache } from "@/lib/ttl-cache";

describe("ttl-cache", () => {
  it("returns the cached value within the TTL window", async () => {
    const fetcher = vi.fn().mockResolvedValue("value-1");
    const cache = makeCache({
      fetcher,
      ttlMs: 10_000,
      label: "test/ttl-window",
    });

    const a = await cache.get();
    const b = await cache.get();
    const c = await cache.get();

    expect(a).toBe("value-1");
    expect(b).toBe("value-1");
    expect(c).toBe("value-1");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("dedupes concurrent cache-miss callers into a single fetch", async () => {
    let resolveFetch: ((v: string) => void) | undefined;
    const pending = new Promise<string>((r) => {
      resolveFetch = r;
    });
    const fetcher = vi.fn().mockReturnValue(pending);
    const cache = makeCache({
      fetcher,
      ttlMs: 10_000,
      label: "test/in-flight",
    });

    const p1 = cache.get();
    const p2 = cache.get();
    const p3 = cache.get();

    resolveFetch!("value-1");
    const [a, b, c] = await Promise.all([p1, p2, p3]);

    expect(a).toBe("value-1");
    expect(b).toBe("value-1");
    expect(c).toBe("value-1");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
