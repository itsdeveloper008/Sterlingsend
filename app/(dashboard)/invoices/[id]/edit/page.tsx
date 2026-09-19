import { notFound } from "next/navigation";
import { requireOnboarding } from "@/actions/auth.actions";
import { EditInvoicePage } from "@/features/invoices";
import { serializeInvoice } from "@/features/invoices/lib/serialize";
import { invoiceService } from "@/services/invoice.service";

export default async function InvoiceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { business } = await requireOnboarding();
  const invoice = await invoiceService.getInvoice(id, business.id);

  if (!invoice) {
    notFound();
  }

  return (
    <EditInvoicePage
      invoice={serializeInvoice(invoice)}
      currency={business.currency}
    />
  );
}
