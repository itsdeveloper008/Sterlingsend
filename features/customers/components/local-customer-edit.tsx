"use client";

import { useEffect, useState } from "react";
import { EditCustomerPage } from "@/features/customers";
import { getLocalCustomer } from "@/lib/local-store/customers.local";
import type { SerializedCustomer } from "@/features/customers/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, PageShell } from "@/components/design-system";
import { ButtonLink } from "@/components/ui/button-link";
import { routes } from "@/config/routes";

export function LocalCustomerEdit({ id }: { id: string }) {
  const [customer, setCustomer] = useState<SerializedCustomer | null | undefined>(
    undefined,
  );

  useEffect(() => {
    setCustomer(getLocalCustomer(id));
  }, [id]);

  if (customer === undefined) {
    return (
      <PageShell>
        <Skeleton className="h-40 w-full" />
      </PageShell>
    );
  }

  if (!customer) {
    return (
      <PageShell>
        <PageHeader
          title="Customer not found"
          description="This customer is not in this browser’s guest workspace."
        />
        <ButtonLink href={routes.customers} variant="outline">
          Back to customers
        </ButtonLink>
      </PageShell>
    );
  }

  return <EditCustomerPage customer={customer} source="local" />;
}
