import type { InvoiceItem, InvoiceStatus, InvoiceTotals } from "@/types";
import { DEFAULT_INVOICE_TEMPLATE_ID } from "@/pdf/templates/catalog";

/** @deprecated Prefer DEFAULT_INVOICE_TEMPLATE_ID from catalog */
export const PDF_TEMPLATE_ID = DEFAULT_INVOICE_TEMPLATE_ID;
export type PdfTemplateId = string;

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
  theme?: {
    layout: string;
    primary: string;
    accent: string;
    name: string;
  };
}

export type PdfActionState = "idle" | "loading" | "generating" | "ready" | "error";
