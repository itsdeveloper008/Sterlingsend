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

/** How `discountRate` is interpreted on a line item. Missing = percent. */
export type DiscountType = "percent" | "fixed";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  /** Percent (0–100) or fixed currency amount, depending on `discountType`. */
  discountRate: number;
  discountType?: DiscountType;
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
