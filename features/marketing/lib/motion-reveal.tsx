"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Entrance reveal: fade + 16px rise over 450ms, once per element.
 * Content stays visible without JavaScript (no opacity:0 in CSS by default).
 * Stagger via delayMs (caller should cap at 6 items × 60ms).
 */
export function MotionReveal({
  children,
  className,
  delayMs,
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in ms (preferred). */
  delayMs?: number;
  /** Legacy alias: seconds (framer-motion style) or ms if > 10. */
  delay?: number;
}) {
  const resolvedDelayMs = (() => {
    if (typeof delayMs === "number") return delayMs;
    if (typeof delay === "number") return delay > 10 ? delay : delay * 1000;
    return 0;
  })();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("ss-reveal", active && "ss-reveal-in", className)}
      style={
        resolvedDelayMs > 0
          ? ({
              ["--ss-reveal-delay" as string]: `${resolvedDelayMs}ms`,
            } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
