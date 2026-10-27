import { siteConfig } from "@/config/site";
import { getDefaultInvoiceDates } from "@/features/invoices/lib/dates";
import {
  createEmptyFormLineItem,
  DEFAULT_FORM_LINE_ITEM_ID,
} from "@/lib/invoice/calculations";
import {
  BUILDER_INVOICE_VERSION,
  type BuilderInvoice,
} from "@/features/invoice-builder/types";
import { DEFAULT_INVOICE_TEMPLATE_ID } from "@/pdf/templates/catalog";

export function createDefaultBuilderInvoice(): BuilderInvoice {
  const { issueDate, dueDate } = getDefaultInvoiceDates(14);

  return {
    version: BUILDER_INVOICE_VERSION,
    savedAt: Date.now(),
    invoiceNumber: "INV-001",
    reference: "",
    issueDate,
    dueDate,
    paymentTermsDays: 14,
    currency: siteConfig.defaultCurrency,
    notes: "Thank you for your business!",
    terms: "",
    templateId: DEFAULT_INVOICE_TEMPLATE_ID,
    accent: undefined,
    showCompanyNumber: false,
    showPayment: false,
    showTerms: false,
    logoDataUrl: undefined,
    business: {
      name: "",
      address: "",
      email: "",
      phone: "",
      vatNumber: "",
      companyNumber: "",
    },
    customer: {
      name: "",
      address: "",
      email: "",
    },
    payment: {
      accountHolder: "",
      bankName: "",
      accountIban: "",
      sortSwift: "",
    },
    items: [
      {
        ...createEmptyFormLineItem(0, DEFAULT_FORM_LINE_ITEM_ID),
        description: "",
        quantity: 1,
        unitPrice: 100,
        vatRate: 0,
        discountRate: 0,
      },
    ],
  };
}

/** Same clean empty sheet as createDefault - used when landing has no saved draft. */
export function createLandingDemoInvoice(): BuilderInvoice {
  return createDefaultBuilderInvoice();
}

export function createEmptyBuilderLineItem() {
  return createEmptyFormLineItem(siteConfig.defaultVatRate);
}

export function hasPaymentDetails(payment: BuilderInvoice["payment"]) {
  return Boolean(
    payment.accountHolder.trim() ||
      payment.bankName.trim() ||
      payment.accountIban.trim() ||
      payment.sortSwift.trim(),
  );
}

export const PAYMENT_TERMS_OPTIONS: {
  days: BuilderInvoice["paymentTermsDays"];
  label: string;
}[] = [
  { days: 0, label: "Due on receipt" },
  { days: 7, label: "7 days" },
  { days: 14, label: "14 days" },
  { days: 30, label: "30 days" },
  { days: 60, label: "60 days" },
];

/** Add calendar days to an ISO date (YYYY-MM-DD), noon-safe. */
export function addDaysToIsoDate(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
