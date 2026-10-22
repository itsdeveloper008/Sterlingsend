import { INVOICE_STATUSES, type InvoiceStatus } from "@/types";

/** User-facing History statuses. Overdue is never stored. */
export type HistoryDisplayStatus = "unpaid" | "paid" | "overdue";

export function getHistoryDisplayStatus(invoice: {
  status: InvoiceStatus;
  dueDate: string;
  now?: Date;
}): HistoryDisplayStatus {
  if (invoice.status === INVOICE_STATUSES.PAID) return "paid";

  const due = new Date(invoice.dueDate);
  const now = invoice.now ?? new Date();
  // Compare calendar dates in local time
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!Number.isNaN(dueDay.getTime()) && dueDay < today) {
    return "overdue";
  }
  return "unpaid";
}

export function historyDisplayLabel(status: HistoryDisplayStatus): string {
  if (status === "paid") return "Paid";
  if (status === "overdue") return "Overdue";
  return "Unpaid";
}

/**
 * Stored → UI mapping (for reports):
 * draft, sent, viewed, cancelled → Unpaid (or Overdue if past due)
 * paid → Paid
 * overdue (legacy stored) → Overdue
 */
export function mapStoredStatusNote(status: InvoiceStatus): string {
  if (status === INVOICE_STATUSES.PAID) return "Paid";
  if (status === INVOICE_STATUSES.OVERDUE) return "Overdue (legacy stored)";
  return "Unpaid (draft/sent/viewed/cancelled)";
}
