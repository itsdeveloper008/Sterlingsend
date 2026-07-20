import type { CurrencyCode, BankDetails } from "@/types";

export const GUEST_INVOICE_VERSION = 1 as const;

export interface GuestBusiness {
  name: string;
  email: string;
  phone?: string;
  address: string;
  vatNumber?: string;
  logoUrl?: string;
  bankDetails?: BankDetails;
}

export interface GuestCustomer {
  name: string;
  email?: string;
  address?: string;
}

export interface GuestInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discountRate: number;
}

export interface GuestInvoice {
  version: typeof GUEST_INVOICE_VERSION;
  savedAt: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  notes?: string;
  currency: CurrencyCode;
  business: GuestBusiness;
  customer: GuestCustomer;
  items: GuestInvoiceItem[];
}

export interface GuestOnboardingSeed {
  businessName: string;
  email: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  country: string;
  vatNumber?: string;
  currency: CurrencyCode;
}
