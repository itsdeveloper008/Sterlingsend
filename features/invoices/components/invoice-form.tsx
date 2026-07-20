"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerPicker } from "@/features/invoices/components/customer-picker";
import {
  InvoiceLineItems,
  useInvoiceTotals,
} from "@/features/invoices/components/invoice-line-items";
import { InvoiceSummary } from "@/features/invoices/components/invoice-summary";
import { ALL_INVOICE_STATUSES } from "@/lib/invoice/status-transitions";
import type { InvoiceFormData } from "@/lib/validations/invoice";
import type { SerializedCustomer } from "@/features/customers/lib/format";
import { INVOICE_STATUSES } from "@/types";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function InvoiceForm({
  values,
  currency,
  selectedCustomer,
  errors = {},
  onChange,
  onCustomerChange,
  disabled,
  showStatus = true,
  lastSavedAt,
  autosaveState,
}: {
  values: InvoiceFormData;
  currency: string;
  selectedCustomer?: SerializedCustomer | null;
  errors?: Record<string, string>;
  onChange: (values: InvoiceFormData) => void;
  onCustomerChange: (customer: SerializedCustomer) => void;
  disabled?: boolean;
  showStatus?: boolean;
  lastSavedAt?: string | null;
  autosaveState?: "idle" | "saving" | "saved" | "error";
}) {
  const totals = useInvoiceTotals(values.items);

  const statusLabel = useMemo(() => {
    if (autosaveState === "saving") return "Saving draft...";
    if (autosaveState === "saved" && lastSavedAt) {
      return `Draft saved at ${new Date(lastSavedAt).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
    if (autosaveState === "error") return "Autosave failed";
    return null;
  }, [autosaveState, lastSavedAt]);

  function patch(patch: Partial<InvoiceFormData>) {
    onChange({ ...values, ...patch });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <div>
            <h2 className="text-base font-medium">Customer</h2>
            <p className="text-sm text-muted-foreground">
              Select an existing customer for this invoice.
            </p>
          </div>
          <CustomerPicker
            value={values.customerId}
            selectedCustomer={selectedCustomer}
            onChange={onCustomerChange}
            error={errors.customerId}
            disabled={disabled}
          />
        </section>

        <section className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <div>
            <h2 className="text-base font-medium">Invoice information</h2>
            <p className="text-sm text-muted-foreground">
              Dates and status for this invoice.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue date</Label>
              <Input
                id="issueDate"
                type="date"
                value={values.issueDate}
                onChange={(event) => patch({ issueDate: event.target.value })}
                disabled={disabled}
              />
              <FieldError message={errors.issueDate} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="date"
                value={values.dueDate}
                onChange={(event) => patch({ dueDate: event.target.value })}
                disabled={disabled}
              />
              <FieldError message={errors.dueDate} />
            </div>

            {showStatus ? (
              <div className="space-y-2 sm:col-span-2">
                <Label>Status</Label>
                <Select
                  value={values.status}
                  onValueChange={(value) =>
                    patch({ status: value as InvoiceFormData["status"] })
                  }
                  disabled={disabled}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_INVOICE_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {values.status === INVOICE_STATUSES.DRAFT && statusLabel ? (
                  <p className="text-xs text-muted-foreground">{statusLabel}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-lg border bg-card p-6 shadow-sm">
          <InvoiceLineItems
            items={values.items}
            currency={currency}
            onChange={(items) => patch({ items })}
            errors={errors}
            disabled={disabled}
          />
        </section>

        <section className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <div>
            <h2 className="text-base font-medium">Note</h2>
            <p className="text-sm text-muted-foreground">
              Optional note shown on the invoice.
            </p>
          </div>
          <Textarea
            value={values.notes ?? ""}
            onChange={(event) => patch({ notes: event.target.value })}
            placeholder="Payment terms or thank you message"
            rows={4}
            disabled={disabled}
          />
        </section>
      </div>

      <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <InvoiceSummary totals={totals} currency={currency} />
      </div>
    </div>
  );
}
