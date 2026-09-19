"use client";

import { useEffect, useState } from "react";
import { InvoiceTemplatePicker } from "@/features/settings/components/invoice-template-picker";
import { getLocalSettings } from "@/lib/local-store/settings.local";
import { DEFAULT_INVOICE_TEMPLATE_ID } from "@/pdf/templates/catalog";
import { Skeleton } from "@/components/ui/skeleton";

/** Hydrates template id from localStorage (server cannot read it). */
export function LocalInvoiceTemplatePicker() {
  const [templateId, setTemplateId] = useState<string | null>(null);

  useEffect(() => {
    setTemplateId(
      getLocalSettings().branding.templateId || DEFAULT_INVOICE_TEMPLATE_ID,
    );
  }, []);

  if (!templateId) {
    return <Skeleton className="h-40 w-full" />;
  }

  return (
    <InvoiceTemplatePicker source="local" initialTemplateId={templateId} />
  );
}
