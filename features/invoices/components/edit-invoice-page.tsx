"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { InvoiceForm } from "@/features/invoices/components/invoice-form";
import { useInvoiceAutosave } from "@/features/invoices/hooks/use-invoice-autosave";
import { updateInvoiceAction } from "@/actions/invoice.actions";
import {
  invoiceToFormData,
  type InvoiceFormData,
} from "@/lib/validations/invoice";
import type { SerializedCustomer } from "@/features/customers/lib/format";
import type { SerializedInvoice } from "@/features/invoices/lib/format";
import { routes } from "@/config/routes";
import { INVOICE_STATUSES } from "@/types";
import { PageHeader, PageShell } from "@/components/design-system";

export function EditInvoicePage({
  invoice,
  currency,
  customer,
}: {
  invoice: SerializedInvoice;
  currency: string;
  customer?: SerializedCustomer | null;
}) {
  const router = useRouter();
  const [values, setValues] = useState<InvoiceFormData>(
    invoiceToFormData(invoice),
  );
  const [selectedCustomer, setSelectedCustomer] = useState<SerializedCustomer | null>(
    customer ?? null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const isDraft = values.status === INVOICE_STATUSES.DRAFT;
  const isLocked =
    invoice.status === INVOICE_STATUSES.PAID ||
    invoice.status === INVOICE_STATUSES.CANCELLED;

  const { lastSavedAt, autosaveState } = useInvoiceAutosave({
    invoiceId: invoice.id,
    values,
    enabled: isDraft && !isLocked,
  });

  function handleCustomerChange(nextCustomer: SerializedCustomer) {
    setSelectedCustomer(nextCustomer);
    setValues((current) => ({ ...current, customerId: nextCustomer.id }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    const result = await updateInvoiceAction(invoice.id, values);
    setSaving(false);

    if (!result.success) {
      if (result.fieldErrors) {
        const nextErrors: Record<string, string> = {};
        for (const [key, messages] of Object.entries(result.fieldErrors)) {
          nextErrors[key] = messages[0] ?? "Invalid value";
        }
        setErrors(nextErrors);
      }
      toast.error(result.error);
      return;
    }

    toast.success("Invoice updated");
    router.push(routes.invoice(invoice.id));
    router.refresh();
  }

  return (
    <PageShell>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <Link
            href={routes.invoice(invoice.id)}
            className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to invoice
          </Link>
          <PageHeader
            title={`Edit ${invoice.invoiceNumber}`}
            description={
              isDraft
                ? "Draft changes autosave while you work."
                : "Update invoice details and save changes."
            }
          />
        </div>

      <InvoiceForm
        values={values}
        currency={currency}
        selectedCustomer={selectedCustomer}
        errors={errors}
        onChange={setValues}
        onCustomerChange={handleCustomerChange}
        disabled={isLocked}
        lastSavedAt={lastSavedAt}
        autosaveState={isDraft ? autosaveState : "idle"}
      />

      <div className="flex justify-end gap-2">
        <ButtonLink href={routes.invoice(invoice.id)} variant="outline">
          Cancel
        </ButtonLink>
        <Button type="submit" disabled={saving || isLocked}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
    </PageShell>
  );
}
