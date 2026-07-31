import { requireOnboarding } from "@/actions/auth.actions";
import { InvoicesListPage } from "@/features/invoices";
import { serializeInvoices } from "@/features/invoices/lib/serialize";
import { invoiceService } from "@/services/invoice.service";

export default async function InvoicesPage() {
  const { business } = await requireOnboarding();

  let invoices: Awaited<
    ReturnType<typeof invoiceService.getInvoices>
  >["invoices"] = [];
  let nextCursor: string | null = null;
  let hasMore = false;

  try {
    const result = await invoiceService.getInvoices({
      businessId: business.id,
    });
    invoices = result.invoices;
    nextCursor = result.nextCursor;
    hasMore = result.hasMore;
  } catch (error) {
    console.error("[invoices] Failed to load invoices", error);
  }

  return (
    <InvoicesListPage
      initialInvoices={serializeInvoices(invoices)}
      initialNextCursor={nextCursor}
      initialHasMore={hasMore}
      currency={business.currency}
    />
  );
}
