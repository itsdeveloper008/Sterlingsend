import { InvoicesListPage } from "@/features/invoices";
import { serializeInvoices } from "@/features/invoices/lib/serialize";
import { requireOnboarding } from "@/actions/auth.actions";
import { invoiceService } from "@/services/invoice.service";

const PAGE_SIZE = 25;

export default async function InvoicesPage() {
  const { business } = await requireOnboarding();

  let invoices: Awaited<
    ReturnType<typeof invoiceService.getInvoices>
  >["invoices"] = [];
  let nextCursor: string | null = null;
  let hasMore = false;
  let loadError = false;

  try {
    const result = await invoiceService.getInvoices({
      businessId: business.id,
      limit: PAGE_SIZE,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
    invoices = result.invoices;
    nextCursor = result.nextCursor;
    hasMore = result.hasMore;
  } catch (error) {
    console.error("[invoices] Failed to load invoices", error);
    loadError = true;
  }

  return (
    <InvoicesListPage
      initialInvoices={serializeInvoices(invoices)}
      initialNextCursor={nextCursor}
      initialHasMore={hasMore}
      currency={business.currency}
      loadError={loadError}
    />
  );
}
