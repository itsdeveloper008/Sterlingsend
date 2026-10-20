"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Mail, MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";

function hideOnMobileBuilder(pathname: string) {
  if (pathname === "/create-invoice" || pathname === "/invoices/new") return true;
  if (/^\/invoices\/[^/]+\/edit$/.test(pathname)) return true;
  return false;
}

export function FloatingContact({ className }: { className?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const mobileHidden = hideOnMobileBuilder(pathname);

  return (
    <div
      className={cn(
        "fixed right-4 z-40 print:hidden",
        "bottom-36 md:bottom-20",
        mobileHidden && "max-md:hidden",
        className,
      )}
    >
      {open ? (
        <div className="glass mb-2 w-64 origin-bottom-right rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-3)] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95">
          <p className="text-sm font-semibold text-foreground">Contact</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Email support - we read every message.
          </p>
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="ss-link-underline mt-3 flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] text-sm font-medium text-[var(--brand-700)]"
          >
            <Mail className="h-4 w-4" aria-hidden />
            {siteConfig.supportEmail}
          </a>
          <CopyButton
            value={siteConfig.supportEmail}
            label="Copy email"
            className="mt-2 w-full"
          />
        </div>
      ) : null}
      <button
        type="button"
        className={cn(
          "glass ml-auto flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)]",
          "shadow-[var(--shadow-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-500)]",
        )}
        aria-expanded={open}
        aria-label={open ? "Close contact panel" : "Open contact panel"}
        onClick={() => setOpen((v) => !v)}
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
