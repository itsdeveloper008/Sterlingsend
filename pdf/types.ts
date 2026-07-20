import type { InvoiceItem, InvoiceStatus, InvoiceTotals } from "@/types";

export const PDF_TEMPLATE_ID = "valix-classic" as const;
export type PdfTemplateId = typeof PDF_TEMPLATE_ID;

export interface InvoicePdfBusiness {
  name: string;
  email: string;
  phone?: string;
  website?: string;
  addressLines: string[];
  vatNumber?: string;
  logoUrl?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    sortCode: string;
  };
}

export interface InvoicePdfCustomer {
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  addressLines: string[];
  vatNumber?: string;
}

export interface InvoicePdfDocument {
  invoiceId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  currency: string;
  items: InvoiceItem[];
  totals: InvoiceTotals;
  notes?: string;
  business: InvoicePdfBusiness;
  customer: InvoicePdfCustomer;
  templateId: PdfTemplateId;
}

export type PdfActionState = "idle" | "loading" | "generating" | "ready" | "error";
