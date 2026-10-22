"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Below-fold entrance only. Content starts fully visible.
 * IntersectionObserver (rootMargin ahead of viewport) adds a one-shot CSS class.
 */
export function MotionReveal({
  children,
  className,
  delayMs,
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
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
    if (reduce || coarse) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "80px 0px", threshold: 0.08 },
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
