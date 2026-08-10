import type { BaseDocument } from "./common";
import { DEFAULT_INVOICE_TEMPLATE_ID } from "@/pdf/templates/catalog";

export interface InvoiceSettings {
  prefix: string;
  nextNumber: number;
  defaultPaymentTermsDays: number;
  defaultNotes?: string;
  showBankDetails: boolean;
  showVatNumber: boolean;
}

export interface BrandingSettings {
  primaryColor?: string;
  accentColor?: string;
  templateId: string;
}

export interface NotificationSettings {
  emailOnPayment: boolean;
  emailOnView: boolean;
}

export interface StripeSettings {
  enabled: boolean;
  accountId?: string;
  connectedAt?: string;
  environment: "test" | "live";
}

export interface Settings extends BaseDocument {
  businessId: string;
  invoice: InvoiceSettings;
  branding: BrandingSettings;
  notifications: NotificationSettings;
  stripe: StripeSettings;
}

export const DEFAULT_SETTINGS: Omit<
  Settings,
  "id" | "businessId" | "createdAt" | "updatedAt"
> = {
  invoice: {
    prefix: "INV-",
    nextNumber: 1,
    defaultPaymentTermsDays: 30,
    defaultNotes: "",
    showBankDetails: true,
    showVatNumber: true,
  },
  branding: {
    templateId: DEFAULT_INVOICE_TEMPLATE_ID,
    primaryColor: "#0d9488",
    accentColor: "#14b8a6",
  },
  notifications: {
    emailOnPayment: true,
    emailOnView: false,
  },
  stripe: {
    enabled: false,
    environment: "test",
  },
};
