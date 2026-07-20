"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete invoice</DialogTitle>
          <DialogDescription>
            This will remove{" "}
            <span className="font-medium text-foreground">
              {invoice?.invoiceNumber}
            </span>{" "}
            from your invoice list. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
