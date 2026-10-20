"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const SESSION_KEY = "ss_loader_seen";

/**
 * Branded first-visit-of-session loader. Hard cap 700ms.
 * Never shown again on in-session navigation.
 */
export function SessionLoader() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      return;
    }

    setVisible(true);
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const maxMs = reduce ? 120 : 700;
    const start = performance.now();

    function dismiss() {
      const elapsed = performance.now() - start;
      const wait = Math.max(0, Math.min(maxMs, maxMs - elapsed));
      window.setTimeout(() => {
        setExiting(true);
        window.setTimeout(() => setVisible(false), reduce ? 0 : 220);
      }, wait);
    }

    if (document.readyState === "complete") {
      dismiss();
    } else {
      window.addEventListener("load", dismiss, { once: true });
      window.setTimeout(dismiss, maxMs);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-background print:hidden",
        "transition-transform duration-[var(--duration-200)] ease-[var(--ease)]",
        exiting && "-translate-y-full",
      )}
      aria-hidden
    >
      <Image
        src={siteConfig.logo}
        alt=""
        width={64}
        height={64}
        className="motion-safe:animate-pulse rounded-[10px]"
        priority
      />
    </div>
  );
}
