import type { BuilderInvoice } from "@/features/invoice-builder/types";
import type { InvoiceFormLineItem } from "@/types";
import { INVOICE_STATUSES } from "@/types";

export type BuilderSavePayload = {
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  issueDate: string;
  dueDate: string;
  status: typeof INVOICE_STATUSES.DRAFT;
  notes?: string;
  items: InvoiceFormLineItem[];
  currency: BuilderInvoice["currency"];
  invoiceNumber?: string;
  templateId: string;
  accent?: string;
  stamp?: BuilderInvoice["stamp"];
  fromBusinessName: string;
  fromBusinessEmail: string;
};

export function builderToSavePayload(
  invoice: BuilderInvoice,
): BuilderSavePayload {
  return {
    clientName: invoice.customer.name.trim(),
    clientEmail: invoice.customer.email.trim() || undefined,
    clientAddress: invoice.customer.address.trim() || undefined,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    status: INVOICE_STATUSES.DRAFT,
    notes: invoice.notes.trim() || undefined,
    items: invoice.items,
    currency: invoice.currency,
    invoiceNumber: invoice.invoiceNumber.trim() || undefined,
    templateId: invoice.templateId,
    accent: invoice.accent,
    stamp: invoice.stamp,
    fromBusinessName: invoice.business.name.trim(),
    fromBusinessEmail: invoice.business.email.trim(),
  };
}

export function invoiceDocToBuilder(doc: {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: BuilderInvoice["currency"];
  notes?: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  items: InvoiceFormLineItem[];
  templateId?: string;
  accent?: string;
  stamp?: BuilderInvoice["stamp"];
}): Partial<BuilderInvoice> {
  return {
    invoiceNumber: doc.invoiceNumber,
    issueDate: doc.issueDate,
    dueDate: doc.dueDate,
    currency: doc.currency,
    notes: doc.notes ?? "",
    templateId: doc.templateId,
    accent: doc.accent,
    stamp: doc.stamp,
    customer: {
      name: doc.clientName,
      email: doc.clientEmail ?? "",
      address: doc.clientAddress ?? "",
    },
    items: doc.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      vatRate: item.vatRate,
      discountRate: item.discountRate,
      discountType: item.discountType,
    })),
  };
}
