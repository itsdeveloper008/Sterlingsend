import { siteConfig } from "@/config/site";
import { getDefaultInvoiceDates } from "@/features/invoices/lib/dates";
import { createEmptyFormLineItem } from "@/lib/invoice/calculations";
import {
  GUEST_INVOICE_VERSION,
  type GuestInvoice,
} from "@/features/guest/types";

function generateGuestInvoiceNumber() {
  const suffix = Date.now().toString(36).slice(-6).toUpperCase();
  return `INV-GUEST-${suffix}`;
}

export function createDefaultGuestInvoice(): GuestInvoice {
  const { issueDate, dueDate } = getDefaultInvoiceDates();

  return {
    version: GUEST_INVOICE_VERSION,
    savedAt: Date.now(),
    invoiceNumber: generateGuestInvoiceNumber(),
    issueDate,
    dueDate,
    notes: "",
    currency: siteConfig.defaultCurrency,
    business: {
      name: "",
      email: "",
      phone: "",
      address: "",
      vatNumber: "",
    },
    customer: {
      name: "",
      email: "",
      address: "",
    },
    items: [
      {
        ...createEmptyFormLineItem(siteConfig.defaultVatRate),
      },
    ],
  };
}

export function createEmptyGuestLineItem() {
  return {
    ...createEmptyFormLineItem(siteConfig.defaultVatRate),
  };
}
