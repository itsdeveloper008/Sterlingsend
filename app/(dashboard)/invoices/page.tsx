import { requireOnboarding } from "@/actions/auth.actions";
import { InvoicesListPage } from "@/features/invoices";
import { serializeInvoices } from "@/features/invoices/lib/serialize";
import { invoiceService } from "@/services/invoice.service";

export default async function InvoicesPage() {
  const { business } = await requireOnboarding();
  const result = await invoiceService.getInvoices({
    businessId: business.id,
  });

  return (
    <InvoicesListPage
      initialInvoices={serializeInvoices(result.invoices)}
      initialNextCursor={result.nextCursor}
      initialHasMore={result.hasMore}
      currency={business.currency}
    />
  );
}
