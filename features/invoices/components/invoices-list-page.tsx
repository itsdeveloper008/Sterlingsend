"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceSearch } from "@/features/invoices/components/invoice-search";
import { InvoiceStatusFilter } from "@/features/invoices/components/invoice-status-filter";
import { InvoiceTable } from "@/features/invoices/components/invoice-table";
import { InvoiceEmptyState } from "@/features/invoices/components/invoice-empty-state";
import { DeleteInvoiceModal } from "@/features/invoices/components/delete-invoice-modal";
import {
  deleteInvoiceAction,
  duplicateInvoiceAction,
  getInvoicesAction,
  searchInvoicesAction,
  updateInvoiceStatusAction,
} from "@/actions/invoice.actions";
import type { SerializedInvoice } from "@/features/invoices/lib/format";
import {
  getHistoryDisplayStatus,
  type HistoryDisplayStatus,
} from "@/features/invoices/lib/display-status";
import { downloadInvoicesCsv } from "@/features/invoices/lib/export-csv";
import { routes } from "@/config/routes";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { PageHeader, PageShell } from "@/components/design-system";
import { INVOICE_STATUSES } from "@/types";

const PAGE_SIZE = 25;

export function InvoicesListPage({
  initialInvoices,
  initialNextCursor,
  initialHasMore,
  currency,
  loadError = false,
}: {
  initialInvoices: SerializedInvoice[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
  currency: string;
  loadError?: boolean;
}) {
  const router = useRouter();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    HistoryDisplayStatus | "all"
  >("all");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [isSearching, startSearchTransition] = useTransition();
  const [loadingMore, setLoadingMore] = useState(false);
  const [listError, setListError] = useState(loadError);
  const [deleteTarget, setDeleteTarget] = useState<SerializedInvoice | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const runSearch = useCallback((term: string) => {
    startSearchTransition(async () => {
      const result = await searchInvoicesAction(term);
      if (!result.success) {
        toast.error(result.error);
        setListError(true);
        return;
      }
      setListError(false);
      setInvoices(result.data ?? []);
      setHasMore(false);
      setNextCursor(null);
    });
  }, []);

  useEffect(() => {
    if (debouncedSearch === "") {
      setInvoices(initialInvoices);
      setHasMore(initialHasMore);
      setNextCursor(initialNextCursor);
      return;
    }
    runSearch(debouncedSearch);
  }, [
    debouncedSearch,
    initialInvoices,
    initialHasMore,
    initialNextCursor,
    runSearch,
  ]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      if (statusFilter === "all") return true;
      return getHistoryDisplayStatus(invoice) === statusFilter;
    });
  }, [invoices, statusFilter]);

  async function handleLoadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    const result = await getInvoicesAction({
      cursor: nextCursor,
      limit: PAGE_SIZE,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
    setLoadingMore(false);
    if (!result.success || !result.data) {
      toast.error(result.success === false ? result.error : "Could not load more");
      return;
    }
    setInvoices((current) => [...current, ...result.data!.invoices]);
    setNextCursor(result.data.nextCursor);
    setHasMore(result.data.hasMore);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteInvoiceAction(deleteTarget.id);
    setDeleting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Invoice deleted");
    setDeleteTarget(null);
    setInvoices((current) =>
      current.filter((invoice) => invoice.id !== deleteTarget.id),
    );
    router.refresh();
  }

  async function handleDuplicate(invoice: SerializedInvoice) {
    const result = await duplicateInvoiceAction(invoice.id);
    if (!result.success || !result.data) {
      toast.error(result.success === false ? result.error : "Duplicate failed");
      return;
    }
    toast.success("Invoice duplicated");
    window.location.href = `${routes.createInvoice}?edit=${result.data.id}`;
  }

  async function handleMarkPaid(invoice: SerializedInvoice) {
    const result = await updateInvoiceStatusAction(
      invoice.id,
      INVOICE_STATUSES.PAID,
    );
    if (!result.success || !result.data) {
      toast.error(result.success === false ? result.error : "Update failed");
      return;
    }
    setInvoices((current) =>
      current.map((row) => (row.id === invoice.id ? result.data! : row)),
    );
    toast.success("Marked as paid");
  }

  async function handleMarkUnpaid(invoice: SerializedInvoice) {
    const result = await updateInvoiceStatusAction(
      invoice.id,
      INVOICE_STATUSES.DRAFT,
    );
    if (!result.success || !result.data) {
      toast.error(result.success === false ? result.error : "Update failed");
      return;
    }
    setInvoices((current) =>
      current.map((row) => (row.id === invoice.id ? result.data! : row)),
    );
    toast.success("Marked as unpaid");
  }

  function handleDownloadPdf(invoice: SerializedInvoice) {
    window.location.href = routes.invoicePdf(invoice.id);
  }

  const showEmpty =
    !isSearching &&
    !listError &&
    filteredInvoices.length === 0 &&
    !debouncedSearch &&
    statusFilter === "all";

  return (
    <PageShell className="ss-calm-zone">
      <PageHeader
        title="History"
        description="Search and manage invoices you have saved."
        action={
          <div className="flex flex-wrap gap-2">
            {filteredInvoices.length > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => downloadInvoicesCsv(filteredInvoices)}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            ) : null}
            <ButtonLink href={routes.createInvoice}>
              <Plus className="mr-2 h-4 w-4" />
              Create invoice
            </ButtonLink>
          </div>
        }
      />

      {listError ? (
        <div className="rounded-[var(--radius-lg)] border border-destructive/30 bg-card px-6 py-10 text-center">
          <p className="text-sm text-foreground">Could not load invoices.</p>
          <Button
            type="button"
            className="mt-4"
            onClick={() => {
              setListError(false);
              router.refresh();
            }}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {!showEmpty && !listError ? (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <InvoiceSearch value={search} onChange={setSearch} />
          <InvoiceStatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      ) : null}

      {isSearching ? (
        <div className="space-y-3" aria-busy>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : null}

      {!isSearching && !listError && showEmpty ? <InvoiceEmptyState /> : null}

      {!isSearching &&
      !listError &&
      !showEmpty &&
      filteredInvoices.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-border-subtle px-6 py-12 text-center text-sm text-muted-foreground">
          No invoices match your filters.
        </div>
      ) : null}

      {!isSearching && !listError && filteredInvoices.length > 0 ? (
        <>
          <InvoiceTable
            invoices={filteredInvoices}
            currency={currency}
            onDelete={setDeleteTarget}
            onDuplicate={handleDuplicate}
            onMarkPaid={handleMarkPaid}
            onMarkUnpaid={handleMarkUnpaid}
            onDownloadPdf={handleDownloadPdf}
          />
          {hasMore && !debouncedSearch ? (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => void handleLoadMore()}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}

      <DeleteInvoiceModal
        invoice={deleteTarget}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </PageShell>
  );
}
