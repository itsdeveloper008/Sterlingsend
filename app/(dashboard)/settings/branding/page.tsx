import { PageShell, SettingsShell } from "@/components/design-system";
import { BusinessLogoUploadForm } from "@/features/settings/components/business-logo-upload-form";
import { InvoiceTemplatePicker } from "@/features/settings/components/invoice-template-picker";
import { LocalInvoiceTemplatePicker } from "@/features/settings/components/local-invoice-template-picker";
import { resolveWorkspaceSource } from "@/lib/workspace/resolve-source";
import { settingsService } from "@/services/settings.service";
import { getInvoiceTemplate } from "@/pdf/templates/catalog";
import { getCurrentUserContext } from "@/actions/auth.actions";

export default async function SettingsBrandingPage() {
  const workspace = await resolveWorkspaceSource();

  if (workspace.source === "local") {
    return (
      <PageShell>
        <SettingsShell
          title="Branding"
          description="Logo and invoice appearance. Guests save templates in this browser until login."
        >
          <div className="space-y-10">
            <p className="text-sm text-muted-foreground">
              Logo upload requires an account. Template choice is saved locally
              for guests and moves to your account when you log in.
            </p>
            <LocalInvoiceTemplatePicker />
          </div>
        </SettingsShell>
      </PageShell>
    );
  }

  const context = await getCurrentUserContext();
  const business = context!.business!;
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
          <InvoiceTemplatePicker
            source="cloud"
            initialTemplateId={template.id}
          />
        </div>
      </SettingsShell>
    </PageShell>
  );
}
