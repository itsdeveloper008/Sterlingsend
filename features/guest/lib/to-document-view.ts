import {
  calculateInvoiceTotals,
  calculateItemsFromForm,
} from "@/lib/invoice/calculations";
import type { InvoiceDocumentViewData } from "@/features/invoices/components/invoice-document-view";
import type { GuestInvoice } from "@/features/guest/types";
import type { InvoiceStatus } from "@/types";
import { INVOICE_STATUSES } from "@/types";

export function guestInvoiceToDocumentView(
  invoice: GuestInvoice,
  status: InvoiceStatus = INVOICE_STATUSES.DRAFT,
): InvoiceDocumentViewData {
  const items = calculateItemsFromForm(invoice.items);
  const totals = calculateInvoiceTotals(items);

  return {
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    status,
    currency: invoice.currency,
    items,
    totals,
    notes: invoice.notes?.trim() || undefined,
    business: {
      name: invoice.business.name,
      email: invoice.business.email,
      logoUrl: invoice.business.logoUrl,
      bankDetails: invoice.business.bankDetails,
    },
    customer: {
      name: invoice.customer.name,
      email: invoice.customer.email,
    },
  };
}
