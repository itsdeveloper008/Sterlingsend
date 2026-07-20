"use client";

import { formatInvoiceCurrency } from "@/features/invoices/lib/format";
import type { InvoiceTotals } from "@/types";
import { cn } from "@/lib/utils";

export function InvoiceSummary({
  totals,
  currency,
  className,
}: {
  totals: InvoiceTotals;
  currency: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm",
        className,
      )}
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
        Summary
      </p>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-[#64748B]">Subtotal</dt>
          <dd className="font-medium tabular-nums text-[#0F172A]">
            {formatInvoiceCurrency(totals.subtotal, currency)}
          </dd>
        </div>
        {totals.discountTotal > 0 ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[#64748B]">Discount</dt>
            <dd className="font-medium tabular-nums text-[#0F172A]">
              -{formatInvoiceCurrency(totals.discountTotal, currency)}
            </dd>
          </div>
        ) : null}
        {totals.vatTotal > 0 ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[#64748B]">VAT</dt>
            <dd className="font-medium tabular-nums text-[#0F172A]">
              {formatInvoiceCurrency(totals.vatTotal, currency)}
            </dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-4 border-t border-[#E2E8F0] pt-3">
          <dt className="text-base font-semibold text-[#0F172A]">Total</dt>
          <dd className="text-xl font-bold tabular-nums text-[#0F172A]">
            {formatInvoiceCurrency(totals.total, currency)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
