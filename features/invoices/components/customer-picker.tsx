"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { searchCustomersAction } from "@/actions/customer.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SerializedCustomer } from "@/features/customers/lib/format";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function CustomerPicker({
  value,
  selectedCustomer,
  onChange,
  error,
  disabled,
}: {
  value: string;
  selectedCustomer?: SerializedCustomer | null;
  onChange: (customer: SerializedCustomer) => void;
  error?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
  const [results, setResults] = useState<SerializedCustomer[]>([]);
  const [isSearching, startSearch] = useTransition();

  useEffect(() => {
    if (!open) return;

    startSearch(async () => {
      const result = await searchCustomersAction(debouncedSearch);
      if (result.success) {
        setResults(result.data ?? []);
      }
    });
  }, [debouncedSearch, open]);

  const displayLabel = selectedCustomer
    ? `${selectedCustomer.name}${selectedCustomer.companyName ? ` · ${selectedCustomer.companyName}` : ""}`
    : "Select customer";

  return (
    <div className="space-y-2">
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "w-full justify-between font-normal",
            !selectedCustomer && "text-muted-foreground",
            error && "border-destructive",
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <User className="h-4 w-4 shrink-0" />
            {displayLabel}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {open ? (
          <div className="absolute z-50 mt-2 w-full rounded-lg border bg-popover p-2 shadow-md">
            <Input
              autoFocus
              placeholder="Search customers..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className="mt-2 max-h-56 overflow-y-auto">
              {isSearching ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">
                  Searching...
                </p>
              ) : results.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">
                  No customers found
                </p>
              ) : (
                results.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-muted",
                      value === customer.id && "bg-muted",
                    )}
                    onClick={() => {
                      onChange(customer);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <span>
                      <span className="font-medium">{customer.name}</span>
                      {customer.companyName ? (
                        <span className="block text-xs text-muted-foreground">
                          {customer.companyName}
                        </span>
                      ) : null}
                    </span>
                    {value === customer.id ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : null}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
