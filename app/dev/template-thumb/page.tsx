"use client";

/**
 * Dev-only: render the live sheet with rich fixture data for thumbnail capture.
 * Query: ?id=classic-teal
 */
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { EditableInvoiceCard } from "@/features/invoice-builder/components/editable-invoice-card";
import { createDefaultBuilderInvoice } from "@/features/invoice-builder/lib/defaults";
import type { BuilderInvoiceAction } from "@/features/invoice-builder/types";
import { Suspense, useCallback } from "react";
import "@/features/invoice-builder/styles/invoice-builder.css";

function ThumbSheet() {
  const params = useSearchParams();
  const templateId = params.get("id") || "classic-teal";

  const invoice = useMemo(() => {
    const base = createDefaultBuilderInvoice();
    return {
      ...base,
      invoiceNumber: "INV-1042",
      issueDate: "2026-10-22",
      dueDate: "2026-11-21",
      currency: "GBP" as const,
      templateId,
      notes:
        "Payment due within 30 days. Sort code 12-34-56 · Account 12345678.",
      business: {
        name: "Northbridge Studio",
        address: "14 Quay Street\nBristol BS1 4AX",
        email: "hello@northbridge.studio",
        phone: "0117 000 0000",
        vatNumber: "GB123456789",
      },
      customer: {
        name: "Harbour & Co",
        address: "88 King Street\nManchester M2 4WQ",
        email: "accounts@harbour.co",
      },
      payment: {
        accountHolder: "Northbridge Studio",
        bankName: "HSBC",
        accountIban: "12345678",
        sortSwift: "12-34-56",
      },
      items: [
        {
          id: "t1",
          description: "Brand identity workshop",
          quantity: 1,
          unitPrice: 1200,
          vatRate: 20,
          discountRate: 5,
          discountType: "percent" as const,
        },
        {
          id: "t2",
          description: "Website design (desktop + mobile)",
          quantity: 1,
          unitPrice: 3400,
          vatRate: 20,
          discountRate: 0,
          discountType: "percent" as const,
        },
        {
          id: "t3",
          description: "Content migration support",
          quantity: 6,
          unitPrice: 85,
          vatRate: 20,
          discountRate: 0,
          discountType: "percent" as const,
        },
      ],
    };
  }, [templateId]);

  const noop = useCallback((_a: BuilderInvoiceAction) => {}, []);

  return (
    <div className="bg-slate-200 p-6">
      <EditableInvoiceCard
        invoice={invoice}
        dispatch={noop}
        onLogoFile={() => {}}
        className="pointer-events-none shadow-none"
      />
    </div>
  );
}

export default function TemplateThumbPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading</div>}>
      <ThumbSheet />
    </Suspense>
  );
}
