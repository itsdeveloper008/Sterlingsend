import type { InvoiceItem, InvoiceStatus, InvoiceTotals } from "./invoice-item";
import type { BankDetails } from "./common";

export const INVOICE_PAYMENT_STATUSES = {
  UNPAID: "unpaid",
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export type InvoicePaymentStatus =
  (typeof INVOICE_PAYMENT_STATUSES)[keyof typeof INVOICE_PAYMENT_STATUSES];

export interface PublicInvoiceBusiness {
  name: string;
  email: string;
  phone?: string;
  website?: string;
  addressLines: string[];
  vatNumber?: string;
  logoUrl?: string;
  bankDetails?: BankDetails;
}

export interface PublicInvoiceCustomer {
  name: string;
  email?: string;
  addressLines: string[];
}

export interface PublicInvoiceView {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentStatus: InvoicePaymentStatus;
  paymentEnabled: boolean;
  currency: string;
  items: InvoiceItem[];
  totals: InvoiceTotals;
  notes?: string;
  business: PublicInvoiceBusiness;
  customer: PublicInvoiceCustomer;
  publicToken: string;
  canPay: boolean;
}
