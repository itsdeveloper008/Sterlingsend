"use server";

import { requireOnboarding } from "@/actions/auth.actions";
import { settingsService } from "@/services/settings.service";
import { getInvoiceTemplate } from "@/pdf/templates/catalog";

export async function updateInvoiceTemplateAction(templateId: string) {
  const { business } = await requireOnboarding();
  const template = getInvoiceTemplate(templateId);

  await settingsService.update(business.id, {
    branding: {
      templateId: template.id,
      primaryColor: template.primary,
      accentColor: template.accent,
    },
  });

  return { success: true as const, templateId: template.id };
}

export async function getInvoiceBrandingAction() {
  const { business } = await requireOnboarding();
  const settings = await settingsService.getByBusinessId(business.id);
  const template = getInvoiceTemplate(settings.branding.templateId);
  return {
    templateId: template.id,
    primaryColor: settings.branding.primaryColor ?? template.primary,
    accentColor: settings.branding.accentColor ?? template.accent,
  };
}
