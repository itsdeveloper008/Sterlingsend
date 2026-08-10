import { requireOnboarding } from "@/actions/auth.actions";
import { CreateInvoicePage } from "@/features/invoices";
import { getDefaultInvoiceDates } from "@/features/invoices/lib/dates";
import { settingsService } from "@/services/settings.service";
import { getInvoiceTemplate } from "@/pdf/templates/catalog";

export default async function NewInvoicePage() {
  const { business } = await requireOnboarding();
  const { issueDate, dueDate } = getDefaultInvoiceDates();
  const settings = await settingsService.getByBusinessId(business.id);
  const template = getInvoiceTemplate(settings.branding.templateId);

  return (
    <CreateInvoicePage
      currency={business.currency}
      issueDate={issueDate}
      dueDate={dueDate}
      initialTemplateId={template.id}
    />
  );
}
