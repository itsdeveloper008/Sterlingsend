"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

/**
 * Intercepts in-app link navigation when the builder has unsaved edits.
 * Esc / Cancel keeps the user on the page. Browser refresh uses beforeunload.
 */
export function UnsavedChangesGuard({ dirty }: { dirty: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!dirtyRef.current) return;
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = (event.target as HTMLElement | null)?.closest("a[href]");
      if (!target) return;
      const anchor = target as HTMLAnchorElement;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === pathname) return;
        event.preventDefault();
        event.stopPropagation();
        setPendingHref(url.pathname + url.search + url.hash);
      } catch {
        // ignore
      }
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  const stay = useCallback(() => setPendingHref(null), []);
  const leave = useCallback(() => {
    if (!pendingHref) return;
    const next = pendingHref;
    setPendingHref(null);
    dirtyRef.current = false;
    router.push(next);
  }, [pendingHref, router]);

  return (
    <ConfirmDialog
      open={pendingHref !== null}
      onOpenChange={(open) => {
        if (!open) stay();
      }}
      title="Leave without saving?"
      description="Your invoice edits are only in this browser tab. Leave and they will be lost."
      confirmLabel="Leave"
      cancelLabel="Stay"
      destructive
      onConfirm={leave}
    />
  );
}
