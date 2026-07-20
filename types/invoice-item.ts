export const INVOICE_STATUSES = {
  DRAFT: "draft",
  SENT: "sent",
  VIEWED: "viewed",
  PAID: "paid",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
} as const;

export type InvoiceStatus =
  (typeof INVOICE_STATUSES)[keyof typeof INVOICE_STATUSES];

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discountRate: number;
  lineSubtotal: number;
  lineVat: number;
  lineDiscount: number;
  lineTotal: number;
}

export interface InvoiceTotals {
  subtotal: number;
  vatTotal: number;
  discountTotal: number;
  total: number;
}

export type InvoiceSummary = InvoiceTotals;
