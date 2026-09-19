import { CreateInvoicePage } from "@/features/invoices";
import { getDefaultInvoiceDates } from "@/features/invoices/lib/dates";
import { resolveWorkspaceSource } from "@/lib/workspace/resolve-source";
import { settingsService } from "@/services/settings.service";
import { getInvoiceTemplate } from "@/pdf/templates/catalog";
import { siteConfig } from "@/config/site";
import { DEFAULT_INVOICE_TEMPLATE_ID } from "@/pdf/templates/catalog";

export default async function NewInvoicePage() {
  const workspace = await resolveWorkspaceSource();
  const { issueDate, dueDate } = getDefaultInvoiceDates();

  if (workspace.source === "local") {
    return (
      <CreateInvoicePage
        source="local"
        currency={siteConfig.defaultCurrency}
        issueDate={issueDate}
        dueDate={dueDate}
        initialTemplateId={DEFAULT_INVOICE_TEMPLATE_ID}
      />
    );
  }

  const settings = await settingsService.getByBusinessId(workspace.businessId!);
  const template = getInvoiceTemplate(settings.branding.templateId);

  return (
    <CreateInvoicePage
      source="cloud"
      currency={workspace.currency ?? siteConfig.defaultCurrency}
      issueDate={issueDate}
      dueDate={dueDate}
      initialTemplateId={template.id}
    />
  );
}
