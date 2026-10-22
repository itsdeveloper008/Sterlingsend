import { createDefaultBuilderInvoice } from "@/features/invoice-builder/lib/defaults";
import type { BuilderInvoice } from "@/features/invoice-builder/types";
import type { InvoicePdfDocument } from "@/pdf/types";
import { isCurrencyCode } from "@/config/currencies";

/** Map the History / public PDF document into the live builder sheet model. */
export function pdfDocumentToBuilder(
  doc: InvoicePdfDocument,
): BuilderInvoice {
  const base = createDefaultBuilderInvoice();
  const currency = isCurrencyCode(doc.currency) ? doc.currency : base.currency;

  return {
    ...base,
    invoiceNumber: doc.invoiceNumber,
    issueDate: doc.issueDate,
    dueDate: doc.dueDate,
    currency,
    notes: doc.notes ?? "",
    templateId: doc.templateId || base.templateId,
    stamp: doc.stamp,
    logoDataUrl: doc.business.logoUrl || undefined,
    business: {
      name: doc.business.name,
      address: doc.business.addressLines.join("\n"),
      email: doc.business.email,
      phone: doc.business.phone ?? "",
      vatNumber: doc.business.vatNumber ?? "",
    },
    customer: {
      name: doc.customer.name,
      address: doc.customer.addressLines.join("\n"),
      email: doc.customer.email ?? "",
    },
    payment: {
      accountHolder: doc.business.bankDetails?.accountName ?? "",
      bankName: "",
      accountIban: doc.business.bankDetails?.accountNumber ?? "",
      sortSwift: doc.business.bankDetails?.sortCode ?? "",
    },
    items:
      doc.items.length > 0
        ? doc.items.map((item, index) => ({
            id: item.id || `line-${index}`,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            vatRate: item.vatRate,
            discountRate: item.discountRate ?? 0,
            discountType: item.discountType ?? "percent",
          }))
        : base.items,
  };
}
