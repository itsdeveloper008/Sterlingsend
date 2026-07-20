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
import { updateInvoiceAction, createInvoiceAction } from "@/actions/invoice.actions";
import {
  defaultInvoiceFormValues,
  type InvoiceFormData,
} from "@/lib/validations/invoice";
import type { SerializedCustomer } from "@/features/customers/lib/format";
import { routes } from "@/config/routes";
import { INVOICE_STATUSES } from "@/types";
import { PageHeader, PageShell } from "@/components/design-system";

export function CreateInvoicePage({
  currency,
  issueDate,
  dueDate,
}: {
  currency: string;
  issueDate: string;
  dueDate: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<InvoiceFormData>(
    defaultInvoiceFormValues(issueDate, dueDate),
  );
  const [selectedCustomer, setSelectedCustomer] =
    useState<SerializedCustomer | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { invoiceId, lastSavedAt, autosaveState } = useInvoiceAutosave({
    invoiceId: null,
    values,
    enabled: true,
    onInvoiceCreated: (id) => {
      router.replace(routes.invoiceEdit(id));
    },
  });

  function handleCustomerChange(customer: SerializedCustomer) {
    setSelectedCustomer(customer);
    setValues((current) => ({ ...current, customerId: customer.id }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    const payload = {
      ...values,
      status: INVOICE_STATUSES.DRAFT,
    };

    const result = invoiceId
      ? await updateInvoiceAction(invoiceId, payload)
      : await createInvoiceAction(payload);

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

    toast.success("Invoice created");
    router.push(routes.invoice(result.data!.id));
    router.refresh();
  }

  return (
    <PageShell>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <Link
            href={routes.invoices}
            className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to invoices
          </Link>
          <PageHeader
            title="New invoice"
            description="Drafts autosave while you work."
          />
        </div>

      <InvoiceForm
        values={values}
        currency={currency}
        selectedCustomer={selectedCustomer}
        errors={errors}
        onChange={setValues}
        onCustomerChange={handleCustomerChange}
        lastSavedAt={lastSavedAt}
        autosaveState={autosaveState}
      />

      <div className="flex justify-end gap-2">
        <ButtonLink href={routes.invoices} variant="outline">
          Cancel
        </ButtonLink>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save invoice"}
        </Button>
      </div>
    </form>
    </PageShell>
  );
}
