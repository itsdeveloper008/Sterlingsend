import type { Business } from "@/types/business";
import type { Invoice } from "@/types/invoice";
import type { InvoicePdfDocument } from "@/pdf/types";
import { formatAddressLines } from "@/pdf/utils/address";
import { getInvoiceTemplate } from "@/pdf/templates/catalog";

export function buildInvoicePdfDocument({
  invoice,
  business,
  templateId,
}: {
  invoice: Invoice;
  business: Business;
  templateId?: string | null;
}): InvoicePdfDocument {
  const template = getInvoiceTemplate(templateId);

  return {
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    status: invoice.status,
    currency: invoice.currency,
    items: invoice.items,
    totals: invoice.totals,
    notes: invoice.notes,
    business: {
      name: business.businessName,
      email: business.email,
      phone: business.phone,
      website: business.website,
      vatNumber: business.vatNumber,
      logoUrl: business.logoUrl,
      bankDetails: business.bankDetails,
      addressLines: formatAddressLines([
        business.addressLine1,
        business.addressLine2,
        business.city,
        business.postcode,
        business.country,
      ]),
    },
    customer: {
      name: invoice.clientName,
      email: invoice.clientEmail,
      addressLines: formatAddressLines(
        invoice.clientAddress ? [invoice.clientAddress] : [],
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
