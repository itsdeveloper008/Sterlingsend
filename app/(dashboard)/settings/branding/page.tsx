import { requireOnboarding } from "@/actions/auth.actions";
import { PageShell, SettingsShell } from "@/components/design-system";
import { BusinessLogoUploadForm } from "@/features/settings/components/business-logo-upload-form";

export default async function SettingsBrandingPage() {
  const { business } = await requireOnboarding();

  return (
    <PageShell>
      <SettingsShell
        title="Branding"
        description="Logo and invoice appearance."
      >
        <BusinessLogoUploadForm
          businessId={business.id}
          logoUrl={business.logoUrl}
          businessName={business.businessName}
        />
      </SettingsShell>
    </PageShell>
  );
}
