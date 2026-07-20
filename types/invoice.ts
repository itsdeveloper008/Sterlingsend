import type { BaseDocument, CurrencyCode, SoftDeletable } from "./common";
import type { InvoicePaymentStatus } from "./public-invoice";
import type {
  InvoiceItem,
  InvoiceStatus,
  InvoiceTotals,
} from "./invoice-item";

export interface Invoice extends BaseDocument, SoftDeletable {
  businessId: string;
  customerId: string;
  invoiceNumber: string;
  invoiceNumberLower: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientEmail?: string;
  items: InvoiceItem[];
  notes?: string;
  currency: CurrencyCode;
  totals: InvoiceTotals;
  publicToken?: string;
  publicUrl?: string;
  paymentEnabled: boolean;
  paymentStatus: InvoicePaymentStatus;
  sentAt?: Date;
  viewedAt?: Date;
  paidAt?: Date;
  stripePaymentIntentId?: string;
  paymentLinkUrl?: string;
}

export type CreateInvoiceInput = Omit<
  Invoice,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "sentAt"
  | "viewedAt"
  | "paidAt"
  | "invoiceNumberLower"
  | "publicToken"
  | "publicUrl"
  | "paymentEnabled"
  | "paymentStatus"
> & {
  invoiceNumberLower?: string;
  publicToken?: string;
  publicUrl?: string;
  paymentEnabled?: boolean;
  paymentStatus?: InvoicePaymentStatus;
};

export type UpdateInvoiceInput = Partial<
  Omit<
    Invoice,
    "id" | "businessId" | "createdAt" | "updatedAt" | "invoiceNumberLower"
  >
>;

export interface InvoiceFormLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discountRate: number;
}

export interface InvoiceFormValues {
  customerId: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  notes: string;
  items: InvoiceFormLineItem[];
}

export interface InvoiceListResult {
  invoices: Invoice[];
  nextCursor: string | null;
  hasMore: boolean;
}

export type { InvoiceItem, InvoiceStatus, InvoiceTotals, InvoiceSummary } from "./invoice-item";
export { INVOICE_STATUSES } from "./invoice-item";
