import { INVOICE_STATUSES, type Invoice } from "@/types";

/** Rolling window for “Paid” totals on the dashboard. */
export const DASHBOARD_PAID_WINDOW_DAYS = 90;

export type DashboardStats = {
  /** Sum of totals for sent + viewed invoices (owed, not overdue). */
  outstandingTotal: number;
  /** Sum of totals for overdue invoices. */
  overdueTotal: number;
  /**
   * Sum of totals for paid invoices whose payment date falls in the last
   * {@link DASHBOARD_PAID_WINDOW_DAYS} days. Uses `paidAt` when set, otherwise
   * `issueDate` as a fallback for older records missing paidAt.
   */
  paidTotal: number;
  /** Count of overdue invoices (needs attention). */
  needsAttentionCount: number;
  /** Total invoice count excluding soft-deleted (caller should pass non-deleted). */
  invoiceCount: number;
};

function invoiceAmount(invoice: Invoice) {
  return invoice.totals?.total ?? 0;
}

function paidReferenceDate(invoice: Invoice): Date {
  if (invoice.paidAt) {
    return invoice.paidAt instanceof Date
      ? invoice.paidAt
      : new Date(invoice.paidAt as string);
  }
  return new Date(invoice.issueDate);
}

export function computeDashboardStats(
  invoices: Invoice[],
  now: Date = new Date(),
): DashboardStats {
  const paidCutoff = new Date(now);
  paidCutoff.setDate(paidCutoff.getDate() - DASHBOARD_PAID_WINDOW_DAYS);

  let outstandingTotal = 0;
  let overdueTotal = 0;
  let paidTotal = 0;
  let needsAttentionCount = 0;

  for (const invoice of invoices) {
    if (invoice.status === INVOICE_STATUSES.CANCELLED) continue;

    const amount = invoiceAmount(invoice);

    if (
      invoice.status === INVOICE_STATUSES.SENT ||
      invoice.status === INVOICE_STATUSES.VIEWED
    ) {
      outstandingTotal += amount;
    }

    if (invoice.status === INVOICE_STATUSES.OVERDUE) {
      overdueTotal += amount;
      needsAttentionCount += 1;
    }

    if (invoice.status === INVOICE_STATUSES.PAID) {
      const paidAt = paidReferenceDate(invoice);
      if (paidAt >= paidCutoff) {
        paidTotal += amount;
      }
    }
  }

  return {
    outstandingTotal,
    overdueTotal,
    paidTotal,
    needsAttentionCount,
    invoiceCount: invoices.length,
  };
}

export function getOverdueInvoices(invoices: Invoice[]): Invoice[] {
  return invoices
    .filter((invoice) => invoice.status === INVOICE_STATUSES.OVERDUE)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function getRecentInvoices(invoices: Invoice[], limit = 5): Invoice[] {
  return [...invoices]
    .sort((a, b) => {
      const aTime =
        a.createdAt instanceof Date
          ? a.createdAt.getTime()
          : new Date(String(a.createdAt)).getTime();
      const bTime =
        b.createdAt instanceof Date
          ? b.createdAt.getTime()
          : new Date(String(b.createdAt)).getTime();
      return bTime - aTime;
    })
    .slice(0, limit);
}
