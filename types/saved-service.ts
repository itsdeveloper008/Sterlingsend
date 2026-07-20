import type { BaseDocument, SoftDeletable } from "./common";

export interface SavedService extends BaseDocument, SoftDeletable {
  businessId: string;
  name: string;
  description?: string;
  unitPrice: number;
  vatApplicable: boolean;
  vatRate: number;
}

export type CreateSavedServiceInput = Omit<
  SavedService,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
>;

export type UpdateSavedServiceInput = Partial<
  Omit<SavedService, "id" | "businessId" | "createdAt" | "updatedAt">
>;
