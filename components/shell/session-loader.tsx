"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const SESSION_KEY = "ss_loader_seen";

/**
 * First-visit loader: CSS/inline only after a 300ms delay if the page is still
 * not interactive. Never covers already-painted content on fast loads.
 */
export function SessionLoader() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_SKIP_SESSION_LOADER === "1" ||
      process.env.NEXT_PUBLIC_SKIP_SESSION_LOADER === "true"
    ) {
      return;
    }
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      return;
    }

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let shown = false;
    let maxTimer = 0;
    let delayTimer = 0;

    function hide() {
      if (!shown) return;
      setExiting(true);
      window.setTimeout(() => setVisible(false), reduce ? 0 : 180);
    }

    function showIfStillPending() {
      if (document.readyState === "complete") return;
      shown = true;
      setVisible(true);
      const maxMs = reduce ? 120 : 700;
      maxTimer = window.setTimeout(hide, maxMs);
    }

    // Only show if still not interactive after 300ms
    delayTimer = window.setTimeout(showIfStillPending, 300);

    function onReady() {
      window.clearTimeout(delayTimer);
      if (!shown) return;
      hide();
    }

    if (document.readyState === "complete") {
      window.clearTimeout(delayTimer);
    } else {
      window.addEventListener("load", onReady, { once: true });
    }

    return () => {
      window.clearTimeout(delayTimer);
      window.clearTimeout(maxTimer);
      window.removeEventListener("load", onReady);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center pt-3 print:hidden",
        "transition-opacity duration-[var(--duration-200)]",
        exiting && "opacity-0",
      )}
      aria-hidden
    >
      <div className="rounded-[10px] bg-background/90 p-2 shadow-[var(--shadow-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={siteConfig.logo}
          alt=""
          width={40}
          height={40}
          className="motion-safe:animate-pulse rounded-[8px]"
        />
      </div>
    </div>
  );
}
