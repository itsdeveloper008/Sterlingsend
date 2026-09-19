"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { CustomerForm } from "@/features/customers/components/customer-form";
import { createCustomerAction } from "@/actions/customer.actions";
import { routes } from "@/config/routes";
import { PageHeader, PageShell } from "@/components/design-system";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { workspaceCreateCustomer } from "@/lib/workspace/client-api";
import type { WorkspaceSource } from "@/lib/workspace/resolve-source";

export function CreateCustomerPage({
  source = "cloud",
}: {
  source?: WorkspaceSource;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(data: Parameters<typeof createCustomerAction>[0]) {
    setLoading(true);
    setErrors({});
    const result = await workspaceCreateCustomer(source, data);
    setLoading(false);

    if (!result.success) {
      if ("fieldErrors" in result && result.fieldErrors) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) fieldErrors[key] = messages[0];
        }
        setErrors(fieldErrors);
      }
      toast.error(result.error);
      return;
    }

    toast.success(
      source === "local"
        ? "Customer saved in this browser"
        : "Customer created",
    );
    router.push(routes.customer(result.data!.id));
    if (source === "cloud") router.refresh();
  }

  return (
    <PageShell className="max-w-3xl">
      <div className="space-y-8">
        <div className="space-y-4">
          <Link
            href={routes.customers}
            className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to customers
          </Link>
          <PageHeader
            title="Add customer"
            description={
              source === "local"
                ? "Saved in this browser until you log in."
                : "Save client details for faster invoicing."
            }
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer details</CardTitle>
            <CardDescription>
              Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerForm
              submitLabel="Create customer"
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
