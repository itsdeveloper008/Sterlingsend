import { formatInvoiceCurrency } from "@/features/invoices/lib/format";
import type { InvoicePdfDocument } from "@/pdf/types";

export function InvoicePdfItems({ document }: { document: InvoicePdfDocument }) {
  const { items, currency } = document;

  return (
    <section className="invoice-pdf-items">
      <div className="invoice-pdf-items-list">
        {items.map((item) => (
          <div key={item.id} className="invoice-pdf-line-item">
            <div className="invoice-pdf-line-item-copy">
              <p className="invoice-pdf-line-item-title">
                {item.description || "-"}
              </p>
              <p className="invoice-pdf-line-item-meta">
                {item.quantity} × {formatInvoiceCurrency(item.unitPrice, currency)}
              </p>
            </div>
            <p className="invoice-pdf-line-item-amount">
              {formatInvoiceCurrency(item.lineTotal, currency)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
