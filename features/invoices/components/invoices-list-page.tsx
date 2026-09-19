"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvoiceSearch } from "@/features/invoices/components/invoice-search";
import { InvoiceStatusFilter } from "@/features/invoices/components/invoice-status-filter";
import { InvoiceTable } from "@/features/invoices/components/invoice-table";
import { InvoiceEmptyState } from "@/features/invoices/components/invoice-empty-state";
import { DeleteInvoiceModal } from "@/features/invoices/components/delete-invoice-modal";
import {
  deleteInvoiceAction,
  duplicateInvoiceAction,
  searchInvoicesAction,
} from "@/actions/invoice.actions";
import type { SerializedInvoice } from "@/features/invoices/lib/format";
import { routes } from "@/config/routes";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { InvoiceStatus } from "@/types";
import { PageHeader, PageShell } from "@/components/design-system";

export function InvoicesListPage({
  initialInvoices,
  initialNextCursor,
  initialHasMore,
  currency,
}: {
  initialInvoices: SerializedInvoice[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
  currency: string;
}) {
  const router = useRouter();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [hasMore] = useState(initialHasMore);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"issueDate" | "total">("issueDate");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [isSearching, startSearchTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<SerializedInvoice | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const runSearch = useCallback((term: string) => {
    startSearchTransition(async () => {
      const result = await searchInvoicesAction(term);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setInvoices(result.data ?? []);
    });
  }, []);

  useEffect(() => {
    if (debouncedSearch === "") {
      setInvoices(initialInvoices);
      return;
    }
    runSearch(debouncedSearch);
  }, [debouncedSearch, initialInvoices, runSearch]);

  const filteredInvoices = useMemo(() => {
    const list = invoices.filter((invoice) =>
      statusFilter === "all" ? true : invoice.status === statusFilter,
    );

    return [...list].sort((a, b) => {
      if (sortBy === "total") {
        return b.totals.total - a.totals.total;
      }
      return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
    });
  }, [invoices, sortBy, statusFilter]);

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
    setDuplicatingId(invoice.id);
    const result = await duplicateInvoiceAction(invoice.id);
    setDuplicatingId(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    if (!result.data) {
      toast.error("Failed to duplicate invoice");
      return;
    }

    toast.success("Invoice duplicated");
    router.push(routes.invoiceEdit(result.data.id));
    router.refresh();
  }

  const showEmpty =
    !isSearching &&
    filteredInvoices.length === 0 &&
    !debouncedSearch &&
    statusFilter === "all";

  return (
    <PageShell>
      <PageHeader
        title="Invoices"
        description="Create, send, and track invoices."
        action={
          <ButtonLink href={routes.invoicesNew} className="shadow-xs">
            <Plus className="mr-2 h-4 w-4" />
            New invoice
          </ButtonLink>
        }
      />

      {!showEmpty && (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <InvoiceSearch value={search} onChange={setSearch} />
          <div className="flex flex-wrap gap-2">
            <InvoiceStatusFilter
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <Select
              value={sortBy}
              onValueChange={(value) =>
                setSortBy(value as "issueDate" | "total")
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="issueDate">Sort by date</SelectItem>
                <SelectItem value="total">Sort by total</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {isSearching ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : showEmpty ? (
        <InvoiceEmptyState />
      ) : filteredInvoices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
          No invoices match your filters.
        </div>
      ) : (
        <>
          <InvoiceTable
            invoices={filteredInvoices}
            currency={currency}
            onDelete={setDeleteTarget}
            onDuplicate={handleDuplicate}
          />
          {hasMore && !debouncedSearch ? (
            <div className="flex justify-center">
              <Button variant="outline" disabled={Boolean(duplicatingId)}>
                Load more (pagination ready)
              </Button>
            </div>
          ) : null}
        </>
      )}

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
