"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  calculateInvoiceTotals,
  calculateItemsFromForm,
} from "@/lib/invoice/calculations";
import { formatInvoiceCurrency } from "@/features/invoices/lib/format";
import type { GuestInvoiceItem } from "@/features/guest/types";

export function GuestTotals({
  items,
  currency,
}: {
  items: GuestInvoiceItem[];
  currency: string;
}) {
  const calculatedItems = calculateItemsFromForm(items);
  const totals = calculateInvoiceTotals(calculatedItems);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Invoice total</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatInvoiceCurrency(totals.subtotal, currency)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Discount</span>
          <span>-{formatInvoiceCurrency(totals.discountTotal, currency)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">VAT</span>
          <span>{formatInvoiceCurrency(totals.vatTotal, currency)}</span>
        </div>
        <div className="flex justify-between gap-4 border-t pt-3 text-base font-semibold">
          <span>Grand total</span>
          <span className="text-primary">
            {formatInvoiceCurrency(totals.total, currency)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
