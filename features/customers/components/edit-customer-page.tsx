"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { CustomerForm } from "@/features/customers/components/customer-form";
import { updateCustomerAction } from "@/actions/customer.actions";
import {
  customerToFormData,
  type CustomerFormData,
} from "@/lib/validations/customer";
import type { SerializedCustomer } from "@/features/customers/lib/format";
import { routes } from "@/config/routes";
import { PageHeader, PageShell } from "@/components/design-system";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EditCustomerPage({
  customer,
}: {
  customer: SerializedCustomer;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(data: CustomerFormData) {
    setLoading(true);
    setErrors({});
    const result = await updateCustomerAction(customer.id, data);
    setLoading(false);

    if (!result.success) {
      if (result.fieldErrors) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) fieldErrors[key] = messages[0];
        }
        setErrors(fieldErrors);
      }
      toast.error(result.error);
      return;
    }

    toast.success("Customer updated");
    router.push(routes.customer(customer.id));
    router.refresh();
  }

  return (
    <PageShell className="max-w-3xl">
      <div className="space-y-8">
        <div className="space-y-4">
          <Link
            href={routes.customer(customer.id)}
            className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to customer
          </Link>
          <PageHeader
            title="Edit customer"
            description={`Update contact and billing details for ${customer.name}.`}
          />
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer details</CardTitle>
          <CardDescription>
            Changes apply to future invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerForm
            initialValues={customerToFormData(customer)}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
            loading={loading}
            errors={errors}
          />
        </CardContent>
      </Card>
      </div>
    </PageShell>
  );
}
