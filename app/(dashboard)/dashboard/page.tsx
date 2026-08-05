import { requireOnboarding } from "@/actions/auth.actions";
import { DashboardOverview } from "@/features/dashboard";
import {
  computeDashboardStats,
  getOverdueInvoices,
  getRecentInvoices,
} from "@/features/dashboard/lib/stats";
import { serializeInvoices } from "@/features/invoices/lib/serialize";
import { invoiceService } from "@/services/invoice.service";

/** Cap for dashboard aggregation - same scan size as invoice search. */
const DASHBOARD_INVOICE_LIMIT = 500;

export default async function DashboardPage() {
  const { business } = await requireOnboarding();

  let invoices: Awaited<
    ReturnType<typeof invoiceService.getInvoices>
  >["invoices"] = [];

  try {
    const result = await invoiceService.getInvoices({
      businessId: business.id,
      limit: DASHBOARD_INVOICE_LIMIT,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
    invoices = result.invoices;
  } catch (error) {
    console.error("[dashboard] Failed to load invoices", error);
  }

  const stats = computeDashboardStats(invoices);
  const overdue = getOverdueInvoices(invoices);
  const recent = getRecentInvoices(invoices, 5);

  return (
    <DashboardOverview
      currency={business.currency}
      stats={stats}
      overdueInvoices={serializeInvoices(overdue)}
      recentInvoices={serializeInvoices(recent)}
    />
  );
}
