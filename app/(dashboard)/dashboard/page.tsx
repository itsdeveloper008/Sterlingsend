import { requireOnboarding } from "@/actions/auth.actions";
import { DashboardOverview } from "@/features/dashboard";
import {
  computeDashboardStats,
  getOverdueInvoices,
  getRecentInvoices,
} from "@/features/dashboard/lib/stats";
import { serializeInvoices } from "@/features/invoices/lib/serialize";
import { invoiceService } from "@/services/invoice.service";

/** Cap for dashboard aggregation — same scan size as invoice search. */
const DASHBOARD_INVOICE_LIMIT = 500;

export default async function DashboardPage() {
  const { business } = await requireOnboarding();
  const result = await invoiceService.getInvoices({
    businessId: business.id,
    limit: DASHBOARD_INVOICE_LIMIT,
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const stats = computeDashboardStats(result.invoices);
  const overdue = getOverdueInvoices(result.invoices);
  const recent = getRecentInvoices(result.invoices, 5);

  return (
    <DashboardOverview
      currency={business.currency}
      stats={stats}
      overdueInvoices={serializeInvoices(overdue)}
      recentInvoices={serializeInvoices(recent)}
    />
  );
}
