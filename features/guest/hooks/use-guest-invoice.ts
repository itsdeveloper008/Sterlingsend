"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  createDefaultGuestInvoice,
  createEmptyGuestLineItem,
} from "@/features/guest/lib/defaults";
import { loadGuestInvoice, saveGuestInvoice } from "@/features/guest/lib/storage";
import { trackGuestEvent } from "@/features/guest/lib/analytics";
import type { GuestInvoice, GuestInvoiceItem } from "@/features/guest/types";

export function useGuestInvoice() {
  const [invoice, setInvoice] = useState<GuestInvoice>(createDefaultGuestInvoice);
  const [hydrated, setHydrated] = useState(false);
  const startedTracked = useRef(false);
  const debouncedInvoice = useDebouncedValue(invoice, 500);

  useEffect(() => {
    const saved = loadGuestInvoice();
    if (saved) {
      setInvoice(saved);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveGuestInvoice(debouncedInvoice);
  }, [debouncedInvoice, hydrated]);

  const updateInvoice = useCallback((patch: Partial<GuestInvoice>) => {
    setInvoice((current) => {
      const next = { ...current, ...patch };

      if (!startedTracked.current) {
        startedTracked.current = true;
        trackGuestEvent("guest_invoice_started");
      }

      return next;
    });
  }, []);

  const updateItems = useCallback((items: GuestInvoiceItem[]) => {
    updateInvoice({ items });
  }, [updateInvoice]);

  const addLineItem = useCallback(() => {
    updateItems([...invoice.items, createEmptyGuestLineItem()]);
  }, [invoice.items, updateItems]);

  const removeLineItem = useCallback(
    (id: string) => {
      if (invoice.items.length === 1) return;
      updateItems(invoice.items.filter((item) => item.id !== id));
    },
    [invoice.items, updateItems],
  );

  const updateLineItem = useCallback(
    (id: string, patch: Partial<GuestInvoiceItem>) => {
      updateItems(
        invoice.items.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
      );
    },
    [invoice.items, updateItems],
  );

  return {
    invoice,
    hydrated,
    updateInvoice,
    updateItems,
    addLineItem,
    removeLineItem,
    updateLineItem,
    setInvoice,
  };
}
