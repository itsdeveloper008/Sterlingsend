import { formatInvoiceDate } from "@/features/invoices/lib/format";
import { getInvoiceStatusHeading } from "@/features/invoices/lib/invoice-document-utils";
import type { InvoicePdfDocument } from "@/pdf/types";
import { PDF_STATUS_COLORS } from "@/pdf/constants";

export function InvoicePdfHeader({ document }: { document: InvoicePdfDocument }) {
  const { business, invoiceNumber, issueDate, dueDate, status } = document;
  const statusColors = PDF_STATUS_COLORS[status];

  return (
    <header className="invoice-pdf-header">
      <div className="invoice-pdf-brand">
        {business.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={business.logoUrl}
            alt={`${business.name} logo`}
            className="invoice-pdf-logo"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="invoice-pdf-logo-fallback" aria-hidden>
            {business.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="invoice-pdf-business-copy">
          <h1 className="invoice-pdf-business-name">{business.name}</h1>
          <div className="invoice-pdf-business-meta">
            {business.addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p>{business.email}</p>
            {business.phone ? <p>{business.phone}</p> : null}
            {business.website ? <p>{business.website}</p> : null}
            {business.vatNumber ? <p>VAT: {business.vatNumber}</p> : null}
          </div>
        </div>
      </div>

      <div className="invoice-pdf-invoice-meta">
        <span
          className="invoice-pdf-status-pill"
          style={{
            background: statusColors.background,
            color: statusColors.text,
          }}
        >
          {getInvoiceStatusHeading(status)}
        </span>
        <p className="invoice-pdf-label">Invoice</p>
        <p className="invoice-pdf-number">{invoiceNumber}</p>
        <dl className="invoice-pdf-dates">
          <div>
            <dt>Issue date</dt>
            <dd>{formatInvoiceDate(issueDate)}</dd>
          </div>
          <div>
            <dt>Due date</dt>
            <dd>{formatInvoiceDate(dueDate)}</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}
