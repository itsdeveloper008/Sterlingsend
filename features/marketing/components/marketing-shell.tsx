"use client";

import { useState } from "react";
import { SkipLink, SiteFooter, SiteHeader } from "@/components/shell";
import "@/features/marketing/styles/marketing.css";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const [, setSearchOpen] = useState(false);

  return (
    <div className="marketing-page flex min-h-screen flex-col antialiased">
      <SkipLink />
      <SiteHeader onOpenSearch={() => setSearchOpen(true)} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
