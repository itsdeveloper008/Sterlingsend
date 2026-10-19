/**
 * THROWWAWAY Phase 1 visual lock page. Do not ship.
 * Renders three fixed InvoicePDFTemplate fixtures for pixel comparison.
 */
import { InvoicePDFTemplate } from "@/pdf/components/invoice-pdf-template";
import type { InvoicePdfDocument } from "@/pdf/types";
import "@/pdf/styles/invoice-pdf.css";

const FIXTURE_BASE: Omit<InvoicePdfDocument, "templateId"> = {
  invoiceId: "fixture-001",
  invoiceNumber: "INV-1001",
  issueDate: "2026-01-15",
  dueDate: "2026-02-14",
  status: "sent",
  currency: "GBP",
  notes: "Thank you for your business.",
  items: [
    {
      id: "line-1",
      description: "Consulting",
      quantity: 2,
      unitPrice: 150,
      vatRate: 20,
      discountRate: 0,
      discountType: "percent",
      lineSubtotal: 300,
      lineVat: 60,
      lineDiscount: 0,
      lineTotal: 360,
    },
  ],
  totals: {
    subtotal: 300,
    discountTotal: 0,
    vatTotal: 60,
    total: 360,
  },
  business: {
    name: "Acme Consulting Ltd",
    email: "hello@acme.test",
    phone: "",
    addressLines: ["1 High Street", "London", "EC1A 1BB", "United Kingdom"],
  },
  customer: {
    name: "Client Co",
    email: "accounts@client.test",
    addressLines: ["10 Client Road", "Manchester", "M1 1AA"],
  },
};

const TEMPLATES = ["classic-teal", "bold-navy", "sidebar-slate"] as const;

export default function InvoiceFixturePage() {
  return (
    <main
      id="main"
      style={{
        background: "#f3f4f6",
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 48,
      }}
    >
      {TEMPLATES.map((templateId) => (
        <div
          key={templateId}
          data-fixture-template={templateId}
          style={{ width: 794, margin: "0 auto" }}
        >
          <InvoicePDFTemplate document={{ ...FIXTURE_BASE, templateId }} />
        </div>
      ))}
    </main>
  );
}
