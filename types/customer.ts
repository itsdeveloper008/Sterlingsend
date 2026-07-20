import type { BaseDocument, SoftDeletable } from "./common";

export interface Customer extends BaseDocument, SoftDeletable {
  businessId: string;
  name: string;
  companyName?: string;
  email: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
  country: string;
  vatNumber?: string;
  notes?: string;
  nameLower: string;
  emailLower: string;
}

export type CreateCustomerInput = Omit<
  Customer,
  "id" | "createdAt" | "updatedAt" | "deletedAt" | "nameLower" | "emailLower"
>;

export type UpdateCustomerInput = Partial<
  Omit<
    Customer,
    "id" | "businessId" | "createdAt" | "updatedAt" | "nameLower" | "emailLower"
  >
>;

export interface CustomerListResult {
  customers: Customer[];
  nextCursor: string | null;
  hasMore: boolean;
}
