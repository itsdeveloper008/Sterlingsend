import type { InvoicePdfDocument } from "@/pdf/types";
import { InvoicePdfHeader } from "@/pdf/components/invoice-pdf-header";
import { InvoicePdfCustomer } from "@/pdf/components/invoice-pdf-customer";
import { InvoicePdfItems } from "@/pdf/components/invoice-pdf-items";
import { InvoicePdfTotals } from "@/pdf/components/invoice-pdf-totals";
import { InvoicePdfFooter } from "@/pdf/components/invoice-pdf-footer";
import { getInvoiceTemplate } from "@/pdf/templates/catalog";
import type { CSSProperties } from "react";

export function InvoicePDFTemplate({
  document,
}: {
  document: InvoicePdfDocument;
}) {
  const template = getInvoiceTemplate(document.templateId);
  const primary = document.theme?.primary ?? template.primary;
  const accent = document.theme?.accent ?? template.accent;
  const layout = document.theme?.layout ?? template.layout;

  return (
    <article
      className="invoice-pdf-template"
      data-template={document.templateId}
      data-layout={layout}
      style={
        {
          "--pdf-primary": primary,
          "--pdf-accent": accent,
        } as CSSProperties
      }
    >
      <div className="invoice-pdf-accent" aria-hidden />
      <div className="invoice-pdf-sidebar-rail" aria-hidden />
      <InvoicePdfHeader document={document} />
      <InvoicePdfCustomer customer={document.customer} />
      <InvoicePdfItems document={document} />
      <InvoicePdfTotals document={document} />
      <InvoicePdfFooter document={document} />
    </article>
  );
}
