import { InvoicesListPage } from "@/features/invoices";
import { serializeInvoices } from "@/features/invoices/lib/serialize";
import { resolveWorkspaceSource } from "@/lib/workspace/resolve-source";
import { invoiceService } from "@/services/invoice.service";
import { siteConfig } from "@/config/site";

export default async function InvoicesPage() {
  const workspace = await resolveWorkspaceSource();

  if (workspace.source === "local") {
    return (
      <InvoicesListPage
        source="local"
        initialInvoices={[]}
        initialNextCursor={null}
        initialHasMore={false}
        currency={siteConfig.defaultCurrency}
      />
    );
  }

  let invoices: Awaited<
    ReturnType<typeof invoiceService.getInvoices>
  >["invoices"] = [];
  let nextCursor: string | null = null;
  let hasMore = false;

  try {
    const result = await invoiceService.getInvoices({
      businessId: workspace.businessId!,
    });
    invoices = result.invoices;
    nextCursor = result.nextCursor;
    hasMore = result.hasMore;
  } catch (error) {
    console.error("[invoices] Failed to load invoices", error);
  }

  return (
    <InvoicesListPage
      source="cloud"
      initialInvoices={serializeInvoices(invoices)}
      initialNextCursor={nextCursor}
      initialHasMore={hasMore}
      currency={workspace.currency ?? siteConfig.defaultCurrency}
    />
  );
}
