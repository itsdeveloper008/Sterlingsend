"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  SiteFooter,
  SiteHeader,
  SkipLink,
  UtmCapture,
} from "@/components/shell";
import "@/features/marketing/styles/marketing.css";

const SiteSearch = dynamic(
  () =>
    import("@/components/shell/site-search").then((m) => ({
      default: m.SiteSearch,
    })),
  { ssr: false },
);

const CookieBanner = dynamic(
  () =>
    import("@/components/shell/cookie-banner").then((m) => ({
      default: m.CookieBanner,
    })),
  { ssr: false },
);

const FloatingContact = dynamic(
  () =>
    import("@/components/shell/floating-contact").then((m) => ({
      default: m.FloatingContact,
    })),
  { ssr: false },
);

const BackToTop = dynamic(
  () =>
    import("@/components/shell/back-to-top").then((m) => ({
      default: m.BackToTop,
    })),
  { ssr: false },
);

const ScrollProgress = dynamic(
  () =>
    import("@/components/shell/scroll-progress").then((m) => ({
      default: m.ScrollProgress,
    })),
  { ssr: false },
);

export function MarketingShell({
  children,
  showScrollProgress = false,
}: {
  children: React.ReactNode;
  showScrollProgress?: boolean;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [extrasReady, setExtrasReady] = useState(false);

  useEffect(() => {
    let idleId: number | undefined;
    const enable = () => setExtrasReady(true);
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(enable, { timeout: 2000 });
    } else {
      idleId = window.setTimeout(enable, 500) as unknown as number;
    }
    return () => {
      if (idleId === undefined) return;
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, []);

  return (
    <div className="marketing-page flex min-h-screen flex-col overflow-x-hidden antialiased">
      <SkipLink />
      {showScrollProgress && extrasReady ? <ScrollProgress /> : null}
      <SiteHeader
        onOpenSearch={() => {
          setExtrasReady(true);
          setSearchOpen(true);
        }}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      {/* Cookie banner mounts with the shell (not idle-gated) so a late large
          paint cannot steal LCP from the hero. Keep copy compact. */}
      <CookieBanner />
      {extrasReady || searchOpen ? (
        <SiteSearch open={searchOpen} onOpenChange={setSearchOpen} />
      ) : null}
      {extrasReady ? (
        <>
          <BackToTop />
          <FloatingContact />
        </>
      ) : null}
      <UtmCapture />
    </div>
  );
}
