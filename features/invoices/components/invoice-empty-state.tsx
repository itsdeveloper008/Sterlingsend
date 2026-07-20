"use client";

import { FileText, Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/design-system";
import { routes } from "@/config/routes";

export function InvoiceEmptyState() {
  return (
    <EmptyState
      icon={FileText}
      title="No invoices yet"
      description="Create your first invoice to start billing customers and tracking payments."
      action={
        <ButtonLink href={routes.invoicesNew} className="shadow-xs">
          <Plus className="mr-2 h-4 w-4" />
          Create invoice
        </ButtonLink>
      }
    />
  );
}
