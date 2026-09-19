"use client";

import { useEffect, useMemo, useState } from "react";
import { InvoicePdfPreviewPage } from "@/pdf/components/invoice-pdf-preview-page";
import { buildInvoicePdfDocument } from "@/pdf/utils/build-document";
import { getLocalInvoice } from "@/lib/local-store/invoices.local";
import { getLocalCustomer } from "@/lib/local-store/customers.local";
import { getLocalSettings } from "@/lib/local-store/settings.local";
import type { SerializedInvoice } from "@/features/invoices/lib/format";
import type { SerializedCustomer } from "@/features/customers/lib/format";
import type { Business } from "@/types/business";
import type { Customer } from "@/types/customer";
import type { Invoice } from "@/types/invoice";
import { LOCAL_BUSINESS_ID } from "@/lib/local-store/keys";
import { siteConfig } from "@/config/site";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, PageShell } from "@/components/design-system";
import { ButtonLink } from "@/components/ui/button-link";
import { routes } from "@/config/routes";

function toInvoice(serialized: SerializedInvoice): Invoice {
  return {
    ...serialized,
    createdAt: new Date(serialized.createdAt),
    updatedAt: new Date(serialized.updatedAt),
    deletedAt: serialized.deletedAt ? new Date(serialized.deletedAt) : undefined,
    sentAt: serialized.sentAt ? new Date(serialized.sentAt) : undefined,
    viewedAt: serialized.viewedAt ? new Date(serialized.viewedAt) : undefined,
    paidAt: serialized.paidAt ? new Date(serialized.paidAt) : undefined,
  };
}

function toCustomer(serialized: SerializedCustomer): Customer {
  return {
    ...serialized,
    createdAt: new Date(serialized.createdAt),
    updatedAt: new Date(serialized.updatedAt),
    deletedAt: serialized.deletedAt ? new Date(serialized.deletedAt) : undefined,
  };
}

function guestBusiness(): Business {
  const now = new Date();
  return {
    id: LOCAL_BUSINESS_ID,
    ownerId: "guest",
    businessName: "Guest workspace",
    email: "",
    addressLine1: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
    currency: siteConfig.defaultCurrency as Business["currency"],
    invoicePrefix: "INV",
    invoiceStartingNumber: 1,
    createdAt: now,
    updatedAt: now,
  };
}

export function LocalInvoicePdf({ id }: { id: string }) {
  const [invoice, setInvoice] = useState<SerializedInvoice | null | undefined>(
    undefined,
  );
  const [customer, setCustomer] = useState<SerializedCustomer | null>(null);
  const [templateId, setTemplateId] = useState<string | undefined>();

  useEffect(() => {
    const local = getLocalInvoice(id);
    setInvoice(local);
    if (local) {
      setCustomer(getLocalCustomer(local.customerId));
      setTemplateId(getLocalSettings().branding.templateId);
    }
  }, [id]);

  const document = useMemo(() => {
    if (!invoice) return null;
    return buildInvoicePdfDocument({
      invoice: toInvoice(invoice),
      business: guestBusiness(),
      customer: customer ? toCustomer(customer) : null,
      templateId,
    });
  }, [invoice, customer, templateId]);

  if (invoice === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[900px] w-full max-w-3xl" />
      </div>
    );
  }

  if (!invoice || !document) {
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

  return <InvoicePdfPreviewPage document={document} />;
}
