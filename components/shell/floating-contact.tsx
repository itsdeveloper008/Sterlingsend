"use client";

import { useState } from "react";
import { Check, Copy, Mail, MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function FloatingContact({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(siteConfig.supportEmail);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className={cn(
        "fixed right-4 z-40 print:hidden",
        "bottom-36 md:bottom-20",
        className,
      )}
    >
      {open ? (
        <div className="glass mb-2 w-64 rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-3)]">
          <p className="text-sm font-semibold text-foreground">Contact</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Email support - we read every message.
          </p>
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="mt-3 flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] text-sm font-medium text-[var(--brand-700)]"
          >
            <Mail className="h-4 w-4" aria-hidden />
            {siteConfig.supportEmail}
          </a>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={() => void copyEmail()}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" aria-hidden />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden />
                Copy email
              </>
            )}
          </Button>
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
