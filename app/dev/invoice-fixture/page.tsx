/**
 * THROWWAWAY visual lock page. Do not ship.
 * Renders three live-sheet fixtures for pixel comparison.
 */
import { InvoiceSheetPreview } from "@/pdf/components/invoice-sheet-preview";
import type { InvoicePdfDocument } from "@/pdf/types";

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
    addressLines: ["1 High Street", "London"],
    phone: "020 0000 0000",
    vatNumber: "GB123",
  },
  customer: {
    name: "Jane Client",
    email: "jane@client.test",
    addressLines: ["2 Client Road"],
  },
};

const TEMPLATES = ["classic-teal", "sidebar-rose", "bold-navy"] as const;

export default function InvoiceFixturePage() {
  return (
    <div className="space-y-10 bg-slate-100 p-8">
      {TEMPLATES.map((templateId) => (
        <div key={templateId} data-fixture={templateId}>
          <p className="mb-2 text-sm font-medium text-slate-600">{templateId}</p>
          <InvoiceSheetPreview
            document={{ ...FIXTURE_BASE, templateId }}
          />
        </div>
      ))}
    </div>
  );
}
