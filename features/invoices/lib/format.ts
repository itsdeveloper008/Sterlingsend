import type { Invoice, InvoiceTotals } from "@/types";
import type { InvoicePaymentStatus } from "@/types/public-invoice";

export type SerializedInvoice = Omit<
  Invoice,
  "createdAt" | "updatedAt" | "deletedAt" | "sentAt" | "viewedAt" | "paidAt"
> & {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  paidAt: string | null;
  paymentStatus: InvoicePaymentStatus;
  paymentEnabled: boolean;
  publicUrl?: string;
  publicToken?: string;
};

export function parseDateValue(value: string | Date | unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }
  return new Date();
}

export function formatInvoiceDate(value: string | Date) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(parseDateValue(value));
  } catch {
    return "-";
  }
}

export function formatInvoiceCurrency(
  amount: number,
  currency: string = "GBP",
) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatInvoiceTime(value: string | Date) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(parseDateValue(value));
  } catch {
    return "";
  }
}

export function formatTotalsSummary(totals: InvoiceTotals, currency: string) {
  return {
    subtotal: formatInvoiceCurrency(totals.subtotal, currency),
    vatTotal: formatInvoiceCurrency(totals.vatTotal, currency),
    discountTotal: formatInvoiceCurrency(totals.discountTotal, currency),
    total: formatInvoiceCurrency(totals.total, currency),
  };
}
