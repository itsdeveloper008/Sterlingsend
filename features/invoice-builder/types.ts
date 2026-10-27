import type { CurrencyCode } from "@/types";
import type { InvoiceFormLineItem } from "@/types";
import type { InvoiceStamp } from "@/features/invoice-builder/lib/stamps";

export const BUILDER_INVOICE_VERSION = 1 as const;

export type { InvoiceStamp };

export type BuilderPaymentDetails = {
  accountHolder: string;
  bankName: string;
  accountIban: string;
  sortSwift: string;
};

export type BuilderBusiness = {
  name: string;
  address: string;
  email: string;
  phone: string;
  vatNumber: string;
  /** Optional company / registration number. */
  companyNumber: string;
};

/** Days from issue date; 0 = due on receipt. */
export type PaymentTermsDays = 0 | 7 | 14 | 30 | 60;

export type BuilderCustomer = {
  name: string;
  address: string;
  email: string;
};

export type BuilderInvoice = {
  version: typeof BUILDER_INVOICE_VERSION;
  savedAt: number;
  invoiceNumber: string;
  /** Optional PO / reference line under the invoice number. */
  reference: string;
  issueDate: string;
  dueDate: string;
  /** Payment terms preset; changing it updates dueDate from issueDate. */
  paymentTermsDays: PaymentTermsDays;
  currency: CurrencyCode;
  notes: string;
  /** Optional terms & conditions text. */
  terms: string;
  /** Selected layout id (or legacy `layout-palette` id). */
  templateId: string;
  /** Accent hex; missing means default teal. */
  accent?: string;
  /** Visual stamp only; missing means none. */
  stamp?: InvoiceStamp;
  /** UI: reveal company number field. */
  showCompanyNumber?: boolean;
  /** UI: reveal payment details block. */
  showPayment?: boolean;
  /** UI: reveal terms textarea. */
  showTerms?: boolean;
  /** Client-side preview only (data URL / object URL) until post-login Storage upload. */
  logoDataUrl?: string;
  business: BuilderBusiness;
  customer: BuilderCustomer;
  payment: BuilderPaymentDetails;
  items: InvoiceFormLineItem[];
};

export type BuilderInvoiceAction =
  | { type: "hydrate"; invoice: BuilderInvoice }
  | { type: "patch"; patch: Partial<BuilderInvoice> }
  | { type: "patchBusiness"; patch: Partial<BuilderBusiness> }
  | { type: "patchCustomer"; patch: Partial<BuilderCustomer> }
  | { type: "patchPayment"; patch: Partial<BuilderPaymentDetails> }
  | { type: "patchItem"; id: string; patch: Partial<InvoiceFormLineItem> }
  | { type: "addItem" }
  | { type: "removeItem"; id: string }
  | { type: "setLogo"; logoDataUrl?: string };
