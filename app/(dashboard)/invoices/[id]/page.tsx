import { notFound } from "next/navigation";
import { InvoiceDetailPage } from "@/features/invoices";
import { LocalInvoiceDetail } from "@/features/invoices/components/local-invoice-detail";
import { serializeInvoice } from "@/features/invoices/lib/serialize";
import { resolveWorkspaceSource } from "@/lib/workspace/resolve-source";
import { invoiceService } from "@/services/invoice.service";
import { getCurrentUserContext } from "@/actions/auth.actions";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workspace = await resolveWorkspaceSource();

  if (workspace.source === "local") {
    return <LocalInvoiceDetail id={id} />;
  }

  const context = await getCurrentUserContext();
  const business = context!.business!;
  const invoice = await invoiceService.getInvoice(id, business.id);
  if (!invoice) notFound();

  return (
    <InvoiceDetailPage
      source="cloud"
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
