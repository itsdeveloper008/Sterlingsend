"use server";

import { requireAuth } from "@/actions/auth.actions";
import { customerService } from "@/services/customer.service";
import { invoiceService } from "@/services/invoice.service";
import { settingsService } from "@/services/settings.service";
import { businessService } from "@/services/business.service";
import { DEFAULT_INVOICE_TEMPLATE_ID, getInvoiceTemplate } from "@/pdf/templates/catalog";
import { INVOICE_STATUSES } from "@/types";
import type { SerializedCustomer } from "@/features/customers/lib/format";
import type { SerializedInvoice } from "@/features/invoices/lib/format";
import type { LocalSettings } from "@/lib/local-store/settings.local";

export type MigrateLocalPayload = {
  customers: SerializedCustomer[];
  invoices: SerializedInvoice[];
  settings: LocalSettings | null;
};

export type MigrateLocalResult =
  | {
      success: true;
      migrated: { customers: number; invoices: number; branding: boolean };
      needsOnboarding?: false;
    }
  | {
      success: true;
      needsOnboarding: true;
      migrated: { customers: number; invoices: number; branding: boolean };
    }
  | { success: false; error: string };

/**
 * Merge strategy (returning users with existing cloud data):
 * - Import local customers/invoices as NEW Firestore docs (never overwrite).
 * - Remap invoice.customerId via the newly created customer ids.
 * - Apply local branding only when cloud branding is still the default template.
 * Flagged for product: this is auto-merge, not a user prompt.
 */
export async function migrateLocalWorkspaceAction(
  payload: MigrateLocalPayload,
): Promise<MigrateLocalResult> {
  try {
    const context = await requireAuth();
    const business =
      context.business ??
      (context.user.businessId
        ? await businessService.getById(context.user.businessId)
        : await businessService.getByOwnerId(context.session.uid));

    if (!business) {
      return {
        success: true,
        needsOnboarding: true,
        migrated: { customers: 0, invoices: 0, branding: false },
      };
    }

    const customerIdMap = new Map<string, string>();
    let customersMigrated = 0;

    for (const local of payload.customers) {
      const created = await customerService.createCustomer({
        businessId: business.id,
        name: local.name,
        companyName: local.companyName,
        email: local.email,
        phone: local.phone,
        addressLine1: local.addressLine1,
        addressLine2: local.addressLine2,
        city: local.city,
        postcode: local.postcode,
        country: local.country || "United Kingdom",
        vatNumber: local.vatNumber,
        notes: local.notes,
      });
      customerIdMap.set(local.id, created.id);
      customersMigrated += 1;
    }

    let invoicesMigrated = 0;
    for (const local of payload.invoices) {
      const mappedCustomerId = customerIdMap.get(local.customerId);
      if (!mappedCustomerId) {
        // Skip invoices whose customer was not in the local snapshot
        continue;
      }

      await invoiceService.createInvoice(business.id, {
        customerId: mappedCustomerId,
        issueDate: local.issueDate,
        dueDate: local.dueDate,
        status: local.status === INVOICE_STATUSES.DRAFT
          ? INVOICE_STATUSES.DRAFT
          : INVOICE_STATUSES.DRAFT,
        notes: local.notes,
        items: local.items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          discountRate: item.discountRate,
          discountType: item.discountType,
        })),
        currency: local.currency || business.currency,
        reserveNumber: true,
      });
      invoicesMigrated += 1;
    }

    let brandingMigrated = false;
    if (payload.settings?.branding?.templateId) {
      const cloudSettings = await settingsService.getByBusinessId(business.id);
      const cloudTemplateId =
        cloudSettings.branding.templateId || DEFAULT_INVOICE_TEMPLATE_ID;
      const localTemplateId = payload.settings.branding.templateId;
      if (
        cloudTemplateId === DEFAULT_INVOICE_TEMPLATE_ID &&
        localTemplateId !== DEFAULT_INVOICE_TEMPLATE_ID
      ) {
        const template = getInvoiceTemplate(localTemplateId);
        await settingsService.update(business.id, {
          branding: {
            templateId: template.id,
            primaryColor: template.primary,
            accentColor: template.accent,
          },
        });
        brandingMigrated = true;
      }
    }

    return {
      success: true,
      migrated: {
        customers: customersMigrated,
        invoices: invoicesMigrated,
        branding: brandingMigrated,
      },
    };
  } catch (error) {
    console.error("[migrateLocalWorkspaceAction]", error);
    return {
      success: false,
      error: "Could not move your local data into your account",
    };
  }
}
