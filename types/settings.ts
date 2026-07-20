import type { BaseDocument } from "./common";

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
    templateId: "default",
    primaryColor: "#111827",
    accentColor: "#2563eb",
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
