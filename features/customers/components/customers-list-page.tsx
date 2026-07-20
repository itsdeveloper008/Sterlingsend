"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerSearch } from "@/features/customers/components/customer-search";
import { CustomerTable } from "@/features/customers/components/customer-table";
import { CustomerEmptyState } from "@/features/customers/components/customer-empty-state";
import { DeleteCustomerModal } from "@/features/customers/components/delete-customer-modal";
import {
  deleteCustomerAction,
  searchCustomersAction,
} from "@/actions/customer.actions";
import type { SerializedCustomer } from "@/features/customers/lib/format";
import { routes } from "@/config/routes";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { PageHeader, PageShell } from "@/components/design-system";

export function CustomersListPage({
  initialCustomers,
  initialNextCursor,
  initialHasMore,
}: {
  initialCustomers: SerializedCustomer[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
}) {
  const router = useRouter();
  const [customers, setCustomers] = useState(initialCustomers);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [isSearching, startSearchTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<SerializedCustomer | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const runSearch = useCallback((term: string) => {
    startSearchTransition(async () => {
      const result = await searchCustomersAction(term);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setCustomers(result.data ?? []);
      setNextCursor(null);
      setHasMore(false);
    });
  }, []);

  useEffect(() => {
    if (debouncedSearch === "") {
      setCustomers(initialCustomers);
      setNextCursor(initialNextCursor);
      setHasMore(initialHasMore);
      return;
    }
    runSearch(debouncedSearch);
  }, [
    debouncedSearch,
    initialCustomers,
    initialHasMore,
    initialNextCursor,
    runSearch,
  ]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteCustomerAction(deleteTarget.id);
    setDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Customer deleted");
    setDeleteTarget(null);
    setCustomers((current) =>
      current.filter((customer) => customer.id !== deleteTarget.id),
    );
    router.refresh();
  }

  const showEmpty = !isSearching && customers.length === 0 && !debouncedSearch;

  return (
    <PageShell>
      <PageHeader
        title="Customers"
        description="Manage clients you invoice regularly."
        action={
          <ButtonLink href={routes.customersNew} className="shadow-xs">
            <Plus className="mr-2 h-4 w-4" />
            Add customer
          </ButtonLink>
        }
      />

      {!showEmpty && (
        <CustomerSearch value={search} onChange={setSearch} />
      )}

      {isSearching ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : showEmpty ? (
        <CustomerEmptyState />
      ) : customers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
          No customers match your search.
        </div>
      ) : (
        <>
          <CustomerTable customers={customers} onDelete={setDeleteTarget} />
          {hasMore && !debouncedSearch ? (
            <div className="flex justify-center">
              <Button variant="outline" disabled>
                Load more (pagination ready)
              </Button>
            </div>
          ) : null}
        </>
      )}

      <DeleteCustomerModal
        customer={deleteTarget}
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
