import type { CurrencyCode } from "@/types";
import type { InvoiceFormLineItem } from "@/types";

export const BUILDER_INVOICE_VERSION = 1 as const;

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
};

export type BuilderCustomer = {
  name: string;
  address: string;
  email: string;
};

export type BuilderInvoice = {
  version: typeof BUILDER_INVOICE_VERSION;
  savedAt: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: CurrencyCode;
  notes: string;
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
