import { requireOnboarding } from "@/actions/auth.actions";
import { PageShell, SettingsShell } from "@/components/design-system";
import { BusinessLogoUploadForm } from "@/features/settings/components/business-logo-upload-form";
import { InvoiceTemplatePicker } from "@/features/settings/components/invoice-template-picker";
import { settingsService } from "@/services/settings.service";
import { getInvoiceTemplate } from "@/pdf/templates/catalog";

export default async function SettingsBrandingPage() {
  const { business } = await requireOnboarding();
  const settings = await settingsService.getByBusinessId(business.id);
  const template = getInvoiceTemplate(settings.branding.templateId);

  return (
    <PageShell>
      <SettingsShell
        title="Branding"
        description="Logo and invoice appearance."
      >
        <div className="space-y-10">
          <BusinessLogoUploadForm
            businessId={business.id}
            logoUrl={business.logoUrl}
            businessName={business.businessName}
          />
          <InvoiceTemplatePicker initialTemplateId={template.id} />
        </div>
      </SettingsShell>
    </PageShell>
  );
}
