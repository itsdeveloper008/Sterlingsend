"use client";

import { useState } from "react";
import {
  BackToTop,
  CookieBanner,
  FloatingContact,
  ScrollProgress,
  SiteFooter,
  SiteHeader,
  SiteSearch,
  SkipLink,
  UtmCapture,
} from "@/components/shell";
import "@/features/marketing/styles/marketing.css";

export function MarketingShell({
  children,
  showScrollProgress = false,
}: {
  children: React.ReactNode;
  /** Enable on long reading pages (legal, guides). */
  showScrollProgress?: boolean;
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="marketing-page flex min-h-screen flex-col antialiased">
      <SkipLink />
      {showScrollProgress ? <ScrollProgress /> : null}
      <SiteHeader onOpenSearch={() => setSearchOpen(true)} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <SiteSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <BackToTop />
      <FloatingContact />
      <CookieBanner />
      <UtmCapture />
    </div>
  );
}
