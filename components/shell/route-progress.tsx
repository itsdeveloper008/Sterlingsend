"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

/** 2px teal top bar between App Router navigations. */
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [width, setWidth] = useState(0);
  const first = useRef(true);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setActive(true);
    setWidth(12);

    timers.current.push(
      window.setTimeout(() => setWidth(70), 80),
      window.setTimeout(() => setWidth(92), 280),
      window.setTimeout(() => {
        setWidth(100);
        window.setTimeout(() => {
          setActive(false);
          setWidth(0);
        }, 180);
      }, 420),
    );

    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, [pathname, searchParams]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-0.5 print:hidden"
      aria-hidden
    >
      <div
        className={cn(
          "h-full bg-[var(--brand-500)] transition-[width] duration-[var(--duration-200)] ease-[var(--ease)]",
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
