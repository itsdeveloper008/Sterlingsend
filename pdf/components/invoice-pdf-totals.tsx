import { formatInvoiceCurrency } from "@/features/invoices/lib/format";
import type { InvoicePdfDocument } from "@/pdf/types";
import { getDisplayVatRate } from "@/features/invoices/lib/invoice-document-utils";

export function InvoicePdfTotals({ document }: { document: InvoicePdfDocument }) {
  const { totals, currency, items } = document;
  const vatRate = getDisplayVatRate(items);

  return (
    <section className="invoice-pdf-totals">
      <dl>
        <div>
          <dt>Subtotal</dt>
          <dd>{formatInvoiceCurrency(totals.subtotal, currency)}</dd>
        </div>
        {totals.discountTotal > 0 ? (
          <div>
            <dt>Discount</dt>
            <dd>-{formatInvoiceCurrency(totals.discountTotal, currency)}</dd>
          </div>
        ) : null}
        {totals.vatTotal > 0 ? (
          <div>
            <dt>VAT ({vatRate}%)</dt>
            <dd>{formatInvoiceCurrency(totals.vatTotal, currency)}</dd>
          </div>
        ) : null}
        <div className="invoice-pdf-grand-total">
          <dt>Total</dt>
          <dd>{formatInvoiceCurrency(totals.total, currency)}</dd>
        </div>
      </dl>
    </section>
  );
}
