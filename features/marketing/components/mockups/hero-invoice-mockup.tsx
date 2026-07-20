"use client";

import { INVOICE_STATUSES } from "@/types";
import { InvoiceDocumentView } from "@/features/invoices/components/invoice-document-view";
import "@/features/invoices/styles/invoice-document.css";

/** Static marketing preview - sample content only, not live product state. */
const heroSample = {
  invoiceNumber: "INV-MUX083",
  issueDate: "2026-07-10",
  dueDate: "2026-08-09",
  status: INVOICE_STATUSES.SENT,
  currency: "GBP",
  items: [
    {
      id: "1",
      description: "Design & consulting",
      quantity: 1,
      unitPrice: 1000,
      vatRate: 20,
      discountRate: 0,
      lineSubtotal: 1000,
      lineVat: 200,
      lineDiscount: 0,
      lineTotal: 1200,
    },
  ],
  totals: {
    subtotal: 1000,
    vatTotal: 200,
    discountTotal: 0,
    total: 1200,
  },
  notes: "Thank you for your business. Payment is due within 30 days.",
  business: {
    name: "Bright Studio Ltd",
    email: "hello@brightstudio.co.uk",
    bankDetails: {
      accountName: "Bright Studio Ltd",
      accountNumber: "12345678",
      sortCode: "00-00-00",
    },
  },
  customer: {
    name: "Oakfield Consulting",
    email: "accounts@oakfield.com",
  },
};

export function HeroInvoiceMockup() {
  return (
    <div className="marketing-hero-mockup pointer-events-none select-none">
      <InvoiceDocumentView
        data={heroSample}
        embedded
        showPlaceholders={false}
        showPoweredBy
      />
    </div>
  );
}
