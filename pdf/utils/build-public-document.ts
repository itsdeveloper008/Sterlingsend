import {
  PDF_TEMPLATE_ID,
  type InvoicePdfDocument,
} from "@/pdf/types";
import type { PublicInvoiceView } from "@/types/public-invoice";

export function buildPublicInvoicePdfDocument(
  invoice: PublicInvoiceView,
): InvoicePdfDocument {
  return {
    invoiceId: invoice.publicToken,
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    status: invoice.status,
    currency: invoice.currency,
    items: invoice.items,
    totals: invoice.totals,
    notes: invoice.notes,
    business: {
      name: invoice.business.name,
      email: invoice.business.email,
      phone: invoice.business.phone,
      website: invoice.business.website,
      vatNumber: invoice.business.vatNumber,
      logoUrl: invoice.business.logoUrl,
      bankDetails: invoice.business.bankDetails,
      addressLines: invoice.business.addressLines,
    },
    customer: {
      name: invoice.customer.name,
      email: invoice.customer.email,
      addressLines: invoice.customer.addressLines,
    },
    templateId: PDF_TEMPLATE_ID,
  };
}
