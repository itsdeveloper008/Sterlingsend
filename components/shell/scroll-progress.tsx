"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** 3px teal reading progress. Opt in on long legal / guide pages only. */
export function ScrollProgress({ className }: { className?: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] print:hidden",
        className,
      )}
      aria-hidden
    >
      <div
        className="h-full origin-left bg-[var(--brand-500)] transition-transform duration-[var(--duration-150)] ease-[var(--ease)] motion-reduce:transition-none"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
