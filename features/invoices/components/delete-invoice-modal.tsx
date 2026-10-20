"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { SerializedInvoice } from "@/features/invoices/lib/format";

export function DeleteInvoiceModal({
  invoice,
  open,
  onOpenChange,
  onConfirm,
  loading,
}: {
  invoice: SerializedInvoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete invoice"
      description={
        <>
          This will remove{" "}
          <span className="font-medium text-foreground">
            {invoice?.invoiceNumber}
          </span>{" "}
          from your invoice list. This action cannot be undone.
        </>
      }
      confirmLabel="Delete invoice"
      cancelLabel="Cancel"
      destructive
      loading={loading}
      onConfirm={onConfirm}
    />
  );
}
