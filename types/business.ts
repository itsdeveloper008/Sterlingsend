import type { BaseDocument, CurrencyCode, BankDetails } from "./common";

export type { BankDetails };

export interface Business extends BaseDocument {
  ownerId: string;
  businessName: string;
  email: string;
  phone?: string;
  website?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  country: string;
  vatNumber?: string;
  logoUrl?: string;
  currency: CurrencyCode;
  invoicePrefix: string;
  invoiceStartingNumber: number;
  invoiceNextNumber?: number;
  bankDetails?: BankDetails;
}

export type CreateBusinessInput = Omit<
  Business,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateBusinessInput = Partial<
  Omit<Business, "id" | "ownerId" | "createdAt" | "updatedAt">
>;
