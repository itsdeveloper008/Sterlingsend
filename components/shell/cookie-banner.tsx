"use client";

import { useEffect, useRef, useState } from "react";
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

  // Publish the banner height so notifications (Toaster) sit above it.
  const bannerRef = useRef<HTMLDivElement>(null);
  const visible = consent === null;
  useEffect(() => {
    const root = document.documentElement;
    const el = bannerRef.current;
    if (!visible || !el) {
      root.style.removeProperty("--cookie-banner-h");
      return;
    }
    const update = () =>
      root.style.setProperty("--cookie-banner-h", `${el.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--cookie-banner-h");
    };
  }, [visible]);

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
      ref={bannerRef}
      className={cn(
        "glass-strong fixed inset-x-0 bottom-0 z-50 px-3 py-2.5 print:hidden",
        className,
      )}
      role="dialog"
      aria-label="Cookie choices"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-xs leading-snug text-muted-foreground">
          Essential storage keeps you signed in and remembers theme and drafts.
          Analytics consent only stores arrival link (UTM) data.{" "}
          <Link
            href={routes.cookies}
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            Cookie policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-10 flex-1 sm:flex-none"
            onClick={() => choose("rejected")}
          >
            Reject
          </Button>
          <Button
            type="button"
            size="sm"
            className="min-h-10 flex-1 sm:flex-none"
            onClick={() => choose("accepted")}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
