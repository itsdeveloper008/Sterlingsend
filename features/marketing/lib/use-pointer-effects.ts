"use client";

import { useEffect } from "react";

/** Idle-load vanilla pointer effects on fine pointers only. */
export function usePointerEffects(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;
    let idleId: number | undefined;

    const boot = () => {
      void import("@/features/marketing/lib/pointer-effects").then((mod) => {
        if (cancelled) return;
        cleanup = mod.initPointerEffects(document);
      });
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(boot, { timeout: 2000 });
    } else {
      idleId = window.setTimeout(boot, 600) as unknown as number;
    }

    return () => {
      cancelled = true;
      cleanup?.();
      if (idleId === undefined) return;
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, [enabled]);
}
