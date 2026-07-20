import "server-only";

import { toDate } from "@/lib/firestore-utils";
import type { Invoice } from "@/types";
import { INVOICE_PAYMENT_STATUSES } from "@/types/public-invoice";
import type { SerializedInvoice } from "@/features/invoices/lib/format";

function serializeOptionalDate(value: unknown): string | null {
  if (!value) return null;
  return toDate(value).toISOString();
}

export function serializeInvoice(invoice: Invoice): SerializedInvoice {
  return {
    ...invoice,
    paymentStatus: invoice.paymentStatus ?? INVOICE_PAYMENT_STATUSES.UNPAID,
    paymentEnabled: invoice.paymentEnabled ?? false,
    createdAt: toDate(invoice.createdAt).toISOString(),
    updatedAt: toDate(invoice.updatedAt).toISOString(),
    deletedAt: invoice.deletedAt
      ? toDate(invoice.deletedAt).toISOString()
      : null,
    sentAt: serializeOptionalDate(invoice.sentAt),
    viewedAt: serializeOptionalDate(invoice.viewedAt),
    paidAt: serializeOptionalDate(invoice.paidAt),
  };
}

export function serializeInvoices(invoices: Invoice[]): SerializedInvoice[] {
  return invoices.map(serializeInvoice);
}
