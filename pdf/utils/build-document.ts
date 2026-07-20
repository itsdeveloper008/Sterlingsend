import type { Business } from "@/types/business";
import type { Customer } from "@/types/customer";
import type { Invoice } from "@/types/invoice";
import {
  PDF_TEMPLATE_ID,
  type InvoicePdfDocument,
} from "@/pdf/types";
import { formatAddressLines } from "@/pdf/utils/address";

export function buildInvoicePdfDocument({
  invoice,
  business,
  customer,
}: {
  invoice: Invoice;
  business: Business;
  customer: Customer | null;
}): InvoicePdfDocument {
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
      name: customer?.name ?? invoice.clientName,
      companyName: customer?.companyName,
      email: customer?.email ?? invoice.clientEmail,
      phone: customer?.phone,
      vatNumber: customer?.vatNumber,
      addressLines: formatAddressLines([
        customer?.addressLine1,
        customer?.addressLine2,
        customer?.city,
        customer?.postcode,
        customer?.country,
      ]),
    },
    templateId: PDF_TEMPLATE_ID,
  };
}
