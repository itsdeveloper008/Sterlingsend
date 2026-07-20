import { AlertTriangle, ArrowRight, Clock, PoundSterling } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PageHeader,
  PageShell,
  StatCard,
} from "@/components/design-system";
import { InvoiceEmptyState } from "@/features/invoices/components/invoice-empty-state";
import { InvoiceTable } from "@/features/invoices/components/invoice-table";
import {
  formatInvoiceCurrency,
  type SerializedInvoice,
} from "@/features/invoices/lib/format";
import {
  DASHBOARD_PAID_WINDOW_DAYS,
  type DashboardStats,
} from "@/features/dashboard/lib/stats";
import { routes } from "@/config/routes";

export function DashboardOverview({
  currency,
  stats,
  overdueInvoices,
  recentInvoices,
}: {
  currency: string;
  stats: DashboardStats;
  overdueInvoices: SerializedInvoice[];
  recentInvoices: SerializedInvoice[];
}) {
  const hasInvoices = stats.invoiceCount > 0;
  const listInvoices =
    overdueInvoices.length > 0 ? overdueInvoices : recentInvoices;
  const listIsOverdue = overdueInvoices.length > 0;

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        description="Overview of your invoices and payments."
        action={
          <ButtonLink href={routes.invoicesNew} className="shadow-xs">
            Create invoice
            <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Outstanding"
          value={formatInvoiceCurrency(stats.outstandingTotal, currency)}
          icon={Clock}
          trend="Sent & viewed, not overdue"
        />
        <StatCard
          label="Overdue"
          value={formatInvoiceCurrency(stats.overdueTotal, currency)}
          icon={AlertTriangle}
          trend={
            stats.needsAttentionCount === 1
              ? "1 invoice needs attention"
              : `${stats.needsAttentionCount} invoices need attention`
          }
        />
        <StatCard
          label="Paid"
          value={formatInvoiceCurrency(stats.paidTotal, currency)}
          icon={PoundSterling}
          // Assumption: Paid totals cover the last DASHBOARD_PAID_WINDOW_DAYS (90).
          trend={`Last ${DASHBOARD_PAID_WINDOW_DAYS} days`}
        />
        <StatCard
          label="Needs attention"
          value={String(stats.needsAttentionCount)}
          icon={AlertTriangle}
          trend="Overdue invoices"
        />
      </div>

      {!hasInvoices ? (
        <InvoiceEmptyState />
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle>
                {listIsOverdue ? "Needs attention" : "Recent invoices"}
              </CardTitle>
              <CardDescription>
                {listIsOverdue
                  ? "Overdue invoices that still need payment."
                  : "Your latest invoice activity."}
              </CardDescription>
            </div>
            <ButtonLink href={routes.invoices} variant="outline" size="sm">
              View all
            </ButtonLink>
          </CardHeader>
          <CardContent>
            <InvoiceTable invoices={listInvoices} currency={currency} readOnly />
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
