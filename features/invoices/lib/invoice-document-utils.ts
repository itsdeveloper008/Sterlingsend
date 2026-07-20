import { siteConfig } from "@/config/site";
import type { InvoiceItem, InvoiceStatus } from "@/types";
import { INVOICE_STATUSES } from "@/types";

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  [INVOICE_STATUSES.DRAFT]: "Draft",
  [INVOICE_STATUSES.SENT]: "Sent",
  [INVOICE_STATUSES.VIEWED]: "Viewed",
  [INVOICE_STATUSES.PAID]: "Paid",
  [INVOICE_STATUSES.OVERDUE]: "Overdue",
  [INVOICE_STATUSES.CANCELLED]: "Cancelled",
};

export const INVOICE_STATUS_STYLES: Record<
  InvoiceStatus,
  { badge: string; dot: string }
> = {
  [INVOICE_STATUSES.DRAFT]: {
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  },
  [INVOICE_STATUSES.SENT]: {
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
  },
  [INVOICE_STATUSES.VIEWED]: {
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
  },
  [INVOICE_STATUSES.PAID]: {
    badge: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  [INVOICE_STATUSES.OVERDUE]: {
    badge: "bg-red-50 text-red-700 ring-red-200",
    dot: "bg-red-500",
  },
  [INVOICE_STATUSES.CANCELLED]: {
    badge: "bg-slate-100 text-slate-500 ring-slate-200",
    dot: "bg-slate-400",
  },
};

export function formatPaymentTermsLabel(issueDate: string, dueDate: string) {
  const issue = new Date(issueDate);
  const due = new Date(dueDate);

  if (Number.isNaN(issue.getTime()) || Number.isNaN(due.getTime())) {
    return "Upon Receipt";
  }

  const diffDays = Math.round(
    (due.getTime() - issue.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 0) {
    return "Upon Receipt";
  }

  return `Net ${diffDays}`;
}

export function getDisplayVatRate(items: InvoiceItem[]) {
  if (items.length === 0) {
    return siteConfig.defaultVatRate;
  }

  const firstRate = items[0]?.vatRate ?? siteConfig.defaultVatRate;
  const allSame = items.every((item) => item.vatRate === firstRate);
  return allSame ? firstRate : siteConfig.defaultVatRate;
}

export function hasBankDetails(
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    sortCode?: string;
  } | null,
) {
  if (!bankDetails) return false;
  return Boolean(
    bankDetails.accountName?.trim() ||
      bankDetails.accountNumber?.trim() ||
      bankDetails.sortCode?.trim(),
  );
}

export function getInvoiceStatusHeading(status: InvoiceStatus) {
  return `${INVOICE_STATUS_LABELS[status]} Invoice`;
}

/** Short rubber-stamp label used on the Teamcamp-style invoice sheet. */
export function getInvoiceStampLabel(status: InvoiceStatus) {
  switch (status) {
    case INVOICE_STATUSES.SENT:
    case INVOICE_STATUSES.VIEWED:
      return "Pending";
    case INVOICE_STATUSES.PAID:
      return "Paid";
    case INVOICE_STATUSES.OVERDUE:
      return "Overdue";
    case INVOICE_STATUSES.CANCELLED:
      return "Void";
    default:
      return "Draft";
  }
}

export function getInvoiceStampTone(
  status: InvoiceStatus,
): "pending" | "draft" | "paid" | "overdue" | "cancelled" {
  switch (status) {
    case INVOICE_STATUSES.SENT:
    case INVOICE_STATUSES.VIEWED:
      return "pending";
    case INVOICE_STATUSES.PAID:
      return "paid";
    case INVOICE_STATUSES.OVERDUE:
      return "overdue";
    case INVOICE_STATUSES.CANCELLED:
      return "cancelled";
    default:
      return "draft";
  }
}
