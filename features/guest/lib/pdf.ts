import {
  calculateInvoiceTotals,
  calculateItemsFromForm,
} from "@/lib/invoice/calculations";
import {
  PDF_TEMPLATE_ID,
  type InvoicePdfDocument,
} from "@/pdf/types";
import { formatAddressLines } from "@/pdf/utils/address";
import type { GuestInvoice } from "@/features/guest/types";
import { INVOICE_STATUSES } from "@/types";

function linesFromMultiline(value?: string) {
  if (!value?.trim()) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function buildGuestPdfDocument(
  guest: GuestInvoice,
): InvoicePdfDocument {
  const items = calculateItemsFromForm(guest.items);
  const totals = calculateInvoiceTotals(items);

  return {
    invoiceId: "guest",
    invoiceNumber: guest.invoiceNumber,
    issueDate: guest.issueDate,
    dueDate: guest.dueDate,
    status: INVOICE_STATUSES.DRAFT,
    currency: guest.currency,
    items,
    totals,
    notes: guest.notes?.trim() || undefined,
    business: {
      name: guest.business.name,
      email: guest.business.email,
      phone: guest.business.phone?.trim() || undefined,
      vatNumber: guest.business.vatNumber?.trim() || undefined,
      addressLines: formatAddressLines(linesFromMultiline(guest.business.address)),
    },
    customer: {
      name: guest.customer.name,
      email: guest.customer.email?.trim() || undefined,
      addressLines: formatAddressLines(linesFromMultiline(guest.customer.address)),
    },
    templateId: PDF_TEMPLATE_ID,
  };
}
