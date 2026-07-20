import type { InvoicePdfDocument } from "@/pdf/types";
import { InvoicePdfHeader } from "@/pdf/components/invoice-pdf-header";
import { InvoicePdfCustomer } from "@/pdf/components/invoice-pdf-customer";
import { InvoicePdfItems } from "@/pdf/components/invoice-pdf-items";
import { InvoicePdfTotals } from "@/pdf/components/invoice-pdf-totals";
import { InvoicePdfFooter } from "@/pdf/components/invoice-pdf-footer";

export function InvoicePDFTemplate({
  document,
}: {
  document: InvoicePdfDocument;
}) {
  return (
    <article className="invoice-pdf-template" data-template={document.templateId}>
      <div className="invoice-pdf-accent" aria-hidden />
      <InvoicePdfHeader document={document} />
      <InvoicePdfCustomer customer={document.customer} />
      <InvoicePdfItems document={document} />
      <InvoicePdfTotals document={document} />
      <InvoicePdfFooter document={document} />
    </article>
  );
}
