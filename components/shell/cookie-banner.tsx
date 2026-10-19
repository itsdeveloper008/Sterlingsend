"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import {
  captureUtmsFromUrl,
  clearConsent,
  persistUtms,
  readConsent,
  writeConsent,
  type ConsentValue,
} from "@/lib/consent";
import { cn } from "@/lib/utils";

export function CookieBanner({ className }: { className?: string }) {
  const [consent, setConsent] = useState<ConsentValue | null | "loading">(
    "loading",
  );

  useEffect(() => {
    setConsent(readConsent());
    const onConsent = () => setConsent(readConsent());
    const onOpenSettings = () => {
      clearConsent();
      setConsent(null);
    };
    window.addEventListener("ss-consent", onConsent);
    window.addEventListener("ss-cookie-settings", onOpenSettings);
    return () => {
      window.removeEventListener("ss-consent", onConsent);
      window.removeEventListener("ss-cookie-settings", onOpenSettings);
    };
  }, []);

  useEffect(() => {
    if (consent !== "accepted") return;
    persistUtms(captureUtmsFromUrl(window.location.search));
  }, [consent]);

  function choose(value: ConsentValue) {
    writeConsent(value);
    setConsent(value);
    if (value === "accepted") {
      persistUtms(captureUtmsFromUrl(window.location.search));
    }
  }

  if (consent === "loading" || consent !== null) return null;

  return (
    <div
      className={cn(
        "glass fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle p-4 shadow-[var(--shadow-3)] print:hidden",
        className,
      )}
      role="dialog"
      aria-label="Cookie choices"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground">
          We use essential storage to keep you signed in and remember your theme
          and drafts. With your consent we also remember which link you arrived
          from (UTM parameters). We do not load a third-party analytics product.{" "}
          <Link
            href={routes.cookies}
            className="font-medium underline-offset-2 hover:underline"
          >
            Cookie policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 flex-1 sm:flex-none"
            onClick={() => choose("rejected")}
          >
            Reject
          </Button>
          <Button
            type="button"
            className="min-h-11 flex-1 sm:flex-none"
            onClick={() => choose("accepted")}
          >
            Accept analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
