"use client";

import { useEffect, useState } from "react";

/**
 * A soft white ambient glow that follows the cursor on desktop.
 * Intentionally subtle — enough to add depth and presence without
 * competing with the content. Respects `prefers-reduced-motion` and
 * disables on touch devices automatically.
 */
export function CursorSpotlight() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canHover = window.matchMedia("(hover: hover)").matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!canHover || reducedMotion) return;

    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[1] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.015)_30%,transparent_60%)] blur-3xl"
      style={{
        transform: `translate3d(${pos.x - 300}px, ${pos.y - 300}px, 0)`,
        transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    />
  );
}
