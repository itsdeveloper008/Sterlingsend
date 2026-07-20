import { INVOICE_STATUSES, type InvoiceStatus } from "@/types";

const TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  [INVOICE_STATUSES.DRAFT]: [
    INVOICE_STATUSES.SENT,
    INVOICE_STATUSES.CANCELLED,
  ],
  [INVOICE_STATUSES.SENT]: [
    INVOICE_STATUSES.VIEWED,
    INVOICE_STATUSES.PAID,
    INVOICE_STATUSES.OVERDUE,
    INVOICE_STATUSES.CANCELLED,
  ],
  [INVOICE_STATUSES.VIEWED]: [
    INVOICE_STATUSES.PAID,
    INVOICE_STATUSES.OVERDUE,
    INVOICE_STATUSES.CANCELLED,
  ],
  [INVOICE_STATUSES.OVERDUE]: [
    INVOICE_STATUSES.PAID,
    INVOICE_STATUSES.CANCELLED,
  ],
  [INVOICE_STATUSES.PAID]: [INVOICE_STATUSES.CANCELLED],
  [INVOICE_STATUSES.CANCELLED]: [],
};

export function canTransitionStatus(
  from: InvoiceStatus,
  to: InvoiceStatus,
): boolean {
  if (from === to) return true;
  return TRANSITIONS[from].includes(to);
}

export function assertStatusTransition(
  from: InvoiceStatus,
  to: InvoiceStatus,
): void {
  if (!canTransitionStatus(from, to)) {
    throw new Error(`Cannot change invoice status from ${from} to ${to}`);
  }
}

export const ALL_INVOICE_STATUSES = Object.values(INVOICE_STATUSES);
