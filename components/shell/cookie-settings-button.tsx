"use client";

import { cn } from "@/lib/utils";

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={cn(
        "text-sm text-muted-foreground hover-fine:hover:text-foreground",
        className,
      )}
      onClick={() => window.dispatchEvent(new Event("ss-cookie-settings"))}
    >
      Cookie settings
    </button>
  );
}
