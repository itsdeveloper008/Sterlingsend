import type { InvoicePdfCustomer } from "@/pdf/types";

export function InvoicePdfCustomer({
  customer,
}: {
  customer: InvoicePdfCustomer;
}) {
  return (
    <section className="invoice-pdf-customer">
      <p className="invoice-pdf-section-label">Bill to</p>
      <h2 className="invoice-pdf-customer-name">{customer.name}</h2>
      {customer.companyName ? (
        <p className="invoice-pdf-customer-company">{customer.companyName}</p>
      ) : null}
      <div className="invoice-pdf-customer-meta">
        {customer.addressLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
        {customer.email ? <p>{customer.email}</p> : null}
        {customer.phone ? <p>{customer.phone}</p> : null}
        {customer.vatNumber ? <p>VAT: {customer.vatNumber}</p> : null}
      </div>
    </section>
  );
}
