import type { BuilderInvoice } from "@/features/invoice-builder/types";
import type { InvoicePdfDocument } from "@/pdf/types";
import {
  calculateInvoiceTotals,
  calculateItemsFromForm,
} from "@/lib/invoice/calculations";
import { formatAddressLines } from "@/pdf/utils/address";
import { getInvoiceTemplate } from "@/pdf/templates/catalog";
import { INVOICE_STATUSES } from "@/types";

export function buildBuilderPdfDocument(
  invoice: BuilderInvoice,
): InvoicePdfDocument {
  const items = calculateItemsFromForm(invoice.items);
  const totals = calculateInvoiceTotals(items);
  const template = getInvoiceTemplate(invoice.templateId);

  return {
    invoiceId: "builder",
    invoiceNumber: invoice.invoiceNumber || "INV-001",
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    status: INVOICE_STATUSES.DRAFT,
    currency: invoice.currency,
    items,
    totals,
    notes: invoice.notes,
    business: {
      name: invoice.business.name || "Your business",
      email: invoice.business.email || "",
      phone: invoice.business.phone || undefined,
      vatNumber: invoice.business.vatNumber || undefined,
      logoUrl: invoice.logoDataUrl,
      addressLines: formatAddressLines(
        invoice.business.address ? [invoice.business.address] : [],
      ),
    },
    customer: {
      name: invoice.customer.name || "Client",
      email: invoice.customer.email || undefined,
      addressLines: formatAddressLines(
        invoice.customer.address ? [invoice.customer.address] : [],
      ),
    },
    templateId: template.id,
    theme: {
      layout: template.layout,
      primary: template.primary,
      accent: template.accent,
      name: template.name,
    },
  };
}
