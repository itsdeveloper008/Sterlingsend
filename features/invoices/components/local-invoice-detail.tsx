"use client";

import { useEffect, useState } from "react";
import { InvoiceDetailPage } from "@/features/invoices";
import { getLocalInvoice } from "@/lib/local-store/invoices.local";
import type { SerializedInvoice } from "@/features/invoices/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, PageShell } from "@/components/design-system";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";

export function LocalInvoiceDetail({ id }: { id: string }) {
  const [invoice, setInvoice] = useState<SerializedInvoice | null | undefined>(
    undefined,
  );

  useEffect(() => {
    setInvoice(getLocalInvoice(id));
  }, [id]);

  if (invoice === undefined) {
    return (
      <PageShell>
        <Skeleton className="h-40 w-full" />
      </PageShell>
    );
  }

  if (!invoice) {
    return (
      <PageShell>
        <PageHeader
          title="Invoice not found"
          description="This invoice is not in this browser’s guest workspace."
        />
        <ButtonLink href={routes.invoices} variant="outline">
          Back to invoices
        </ButtonLink>
      </PageShell>
    );
  }

  return (
    <InvoiceDetailPage
      source="local"
      invoice={invoice}
      currency={invoice.currency || siteConfig.defaultCurrency}
      business={{
        name: "Guest workspace",
        email: undefined,
        logoUrl: undefined,
        bankDetails: undefined,
      }}
    />
  );
}
