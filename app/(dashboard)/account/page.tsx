import { requireOnboarding } from "@/actions/auth.actions";
import { AccountPage } from "@/features/account/components/account-page";
import { settingsService } from "@/services/settings.service";
import { getInvoiceTemplate } from "@/pdf/templates/catalog";

export default async function AccountRoutePage() {
  const { business } = await requireOnboarding();
  const settings = await settingsService.getByBusinessId(business.id);
  const template = getInvoiceTemplate(settings.branding.templateId);

  return (
    <AccountPage
      businessId={business.id}
      businessName={business.businessName}
      email={business.email}
      logoUrl={business.logoUrl}
      templateId={template.id}
      accentColor={settings.branding.accentColor ?? template.accent}
    />
  );
}
