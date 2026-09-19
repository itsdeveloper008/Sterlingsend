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
import type { SerializedCustomer } from "@/features/customers/lib/format";
import { routes } from "@/config/routes";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { PageHeader, PageShell } from "@/components/design-system";
import type { WorkspaceSource } from "@/lib/workspace/resolve-source";
import {
  workspaceDeleteCustomer,
  workspaceSearchCustomers,
} from "@/lib/workspace/client-api";
import { listLocalCustomers } from "@/lib/local-store/customers.local";

export function CustomersListPage({
  source = "cloud",
  initialCustomers,
  initialNextCursor,
  initialHasMore,
}: {
  source?: WorkspaceSource;
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
  const [hydratedLocal, setHydratedLocal] = useState(source !== "local");
  const [deleteTarget, setDeleteTarget] = useState<SerializedCustomer | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (source !== "local") return;
    setCustomers(listLocalCustomers());
    setHydratedLocal(true);
  }, [source]);

  const runSearch = useCallback(
    (term: string) => {
      startSearchTransition(async () => {
        try {
          const results = await workspaceSearchCustomers(source, term);
          setCustomers(results);
          setNextCursor(null);
          setHasMore(false);
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Failed to search customers",
          );
        }
      });
    },
    [source],
  );

  useEffect(() => {
    if (!hydratedLocal) return;
    if (debouncedSearch === "") {
      if (source === "local") {
        setCustomers(listLocalCustomers());
      } else {
        setCustomers(initialCustomers);
      }
      setNextCursor(initialNextCursor);
      setHasMore(initialHasMore);
      return;
    }
    runSearch(debouncedSearch);
  }, [
    debouncedSearch,
    hydratedLocal,
    initialCustomers,
    initialHasMore,
    initialNextCursor,
    runSearch,
    source,
  ]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await workspaceDeleteCustomer(source, deleteTarget.id);
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
    if (source === "cloud") router.refresh();
  }

  const showEmpty = !isSearching && customers.length === 0 && !debouncedSearch;

  return (
    <PageShell>
      <PageHeader
        title="Customers"
        description={
          source === "local"
            ? "Saved in this browser until you log in."
            : "Manage clients you invoice regularly."
        }
        action={
          <ButtonLink href={routes.customersNew} className="shadow-xs">
            <Plus className="mr-2 h-4 w-4" />
            Add customer
          </ButtonLink>
        }
      />

      {!showEmpty && <CustomerSearch value={search} onChange={setSearch} />}

      {!hydratedLocal || isSearching ? (
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
