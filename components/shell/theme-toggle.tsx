"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      className={cn(
        "neu relative inline-flex h-10 w-[3.25rem] shrink-0 items-center rounded-[var(--radius-md)] px-1",
        "text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-500)]",
        className,
      )}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <span
        className={cn(
          "absolute left-1 flex size-7 items-center justify-center rounded-[calc(var(--radius-md)-2px)] bg-background shadow-[var(--shadow-1)]",
          "transition-transform duration-[var(--duration-200)] ease-[var(--ease)]",
          isDark && "translate-x-[1.35rem]",
        )}
        aria-hidden
      >
        {mounted ? (
          isDark ? (
            <Moon className="h-3.5 w-3.5" />
          ) : (
            <Sun className="h-3.5 w-3.5" />
          )
        ) : (
          <span className="h-3.5 w-3.5" />
        )}
      </span>
      <span className="sr-only">
        {isDark ? "Dark theme" : "Light theme"}
      </span>
    </button>
  );
}
