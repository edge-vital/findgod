"use client";

import { useEffect } from "react";

/**
 * Fires the `landed` funnel event exactly once per page load.
 *
 * The endpoint (`/api/track/landed`) itself dedupes via the
 * `findgod_session_id` cookie — returning visitors are a no-op. A
 * `sessionStorage` flag on the client prevents duplicate hits from
 * React's StrictMode double-invocation in dev.
 *
 * Rendered near the root of the homepage only; no visible UI.
 */
export function LandedTracker() {
  useEffect(() => {
    const KEY = "findgod_landed_fired";
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(KEY) === "1") return;
    sessionStorage.setItem(KEY, "1");

    void fetch("/api/track/landed", {
      method: "POST",
      keepalive: true,
    }).catch(() => {
      // Swallow network errors — tracking is best-effort.
    });
  }, []);

  return null;
}
