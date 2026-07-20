import { siteConfig } from "@/config/site";
import { getDefaultInvoiceDates } from "@/features/invoices/lib/dates";
import { createEmptyFormLineItem } from "@/lib/invoice/calculations";
import {
  BUILDER_INVOICE_VERSION,
  type BuilderInvoice,
} from "@/features/invoice-builder/types";

export function createDefaultBuilderInvoice(): BuilderInvoice {
  const { issueDate, dueDate } = getDefaultInvoiceDates(14);

  return {
    version: BUILDER_INVOICE_VERSION,
    savedAt: Date.now(),
    invoiceNumber: "INV-001",
    issueDate,
    dueDate,
    currency: siteConfig.defaultCurrency,
    notes: "Thank you for your business!",
    logoDataUrl: undefined,
    business: {
      name: "",
      address: "",
      email: "",
      phone: "",
      vatNumber: "",
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
        ...createEmptyFormLineItem(0),
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
