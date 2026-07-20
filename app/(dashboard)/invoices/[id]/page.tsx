import { notFound } from "next/navigation";
import { requireOnboarding } from "@/actions/auth.actions";
import { InvoiceDetailPage } from "@/features/invoices";
import { serializeInvoice } from "@/features/invoices/lib/serialize";
import { invoiceService } from "@/services/invoice.service";

export default async function InvoicePage({
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
    <InvoiceDetailPage
      invoice={serializeInvoice(invoice)}
      currency={business.currency}
      business={{
        name: business.businessName,
        email: business.email,
        logoUrl: business.logoUrl,
        bankDetails: business.bankDetails,
      }}
    />
  );
}
