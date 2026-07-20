"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { autosaveInvoiceAction } from "@/actions/invoice.actions";
import type { InvoiceFormData } from "@/lib/validations/invoice";
import { INVOICE_STATUSES } from "@/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function useInvoiceAutosave({
  invoiceId,
  values,
  enabled,
  onInvoiceCreated,
}: {
  invoiceId: string | null;
  values: InvoiceFormData;
  enabled: boolean;
  onInvoiceCreated?: (invoiceId: string) => void;
}) {
  const [currentInvoiceId, setCurrentInvoiceId] = useState(invoiceId);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [autosaveState, setAutosaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const debouncedValues = useDebouncedValue(values, 2000);
  const isFirstRun = useRef(true);

  const save = useCallback(async () => {
    if (!enabled || debouncedValues.status !== INVOICE_STATUSES.DRAFT) {
      return;
    }

    if (!debouncedValues.customerId) {
      return;
    }

    setAutosaveState("saving");
    const result = await autosaveInvoiceAction(
      currentInvoiceId,
      debouncedValues,
    );

    if (!result.success) {
      setAutosaveState("error");
      return;
    }

    if (!currentInvoiceId && result.data?.id) {
      setCurrentInvoiceId(result.data.id);
      onInvoiceCreated?.(result.data.id);
    }

    setLastSavedAt(result.data?.updatedAt ?? new Date().toISOString());
    setAutosaveState("saved");
  }, [
    currentInvoiceId,
    debouncedValues,
    enabled,
    onInvoiceCreated,
  ]);

  useEffect(() => {
    setCurrentInvoiceId(invoiceId);
  }, [invoiceId]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    void save();
  }, [save]);

  return {
    invoiceId: currentInvoiceId,
    lastSavedAt,
    autosaveState,
  };
}
