"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const SiteSearch = dynamic(
  () =>
    import("@/components/shell/site-search").then((m) => ({
      default: m.SiteSearch,
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

/**
 * Idle-gated chrome that must not affect LCP (search, back-to-top, contact).
 * Cookie banner stays outside this island.
 */
export function MarketingShellExtras({
  showScrollProgress = false,
}: {
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
    <>
      {showScrollProgress && extrasReady ? <ScrollProgress /> : null}
      {extrasReady || searchOpen ? (
        <SiteSearch open={searchOpen} onOpenChange={setSearchOpen} />
      ) : null}
      {extrasReady ? (
        <>
          <BackToTop />
          <FloatingContact />
        </>
      ) : null}
      {/* Search opener for header — listen for custom event */}
      <MarketingSearchBridge
        onOpen={() => {
          setExtrasReady(true);
          setSearchOpen(true);
        }}
      />
    </>
  );
}

function MarketingSearchBridge({ onOpen }: { onOpen: () => void }) {
  useEffect(() => {
    const handler = () => onOpen();
    window.addEventListener("ss-open-search", handler);
    return () => window.removeEventListener("ss-open-search", handler);
  }, [onOpen]);
  return null;
}
