"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/actions/auth.actions";
import { ONBOARDING_BUSINESS_DEFAULTS } from "@/lib/validations/onboarding";
import { generateInvoiceNumber } from "@/lib/invoice/calculations";
import { businessService } from "@/services/business.service";
import { invoiceService } from "@/services/invoice.service";
import { userService } from "@/services/user.service";
import { settingsService } from "@/services/settings.service";
import { serializeInvoice } from "@/features/invoices/lib/serialize";
import type { SerializedInvoice } from "@/features/invoices/lib/format";
import type { BuilderSavePayload } from "@/features/invoice-builder/lib/map-builder-to-invoice";
import { routes } from "@/config/routes";
import { INVOICE_STATUSES } from "@/types";

export type BuilderInvoiceActionResult =
  | {
      success: true;
      data: SerializedInvoice;
      createdBusiness: boolean;
      suggestedOnboarding: boolean;
    }
  | { success: false; error: string };

function resolveBusinessName(
  fromInvoice: string,
  displayName: string,
  email: string,
): string | null {
  if (fromInvoice.trim()) return fromInvoice.trim();
  if (displayName.trim()) return displayName.trim();
  const local = email.split("@")[0]?.trim();
  if (local) return local;
  return null;
}

async function ensureBusinessForBuilderSave(options: {
  uid: string;
  email: string;
  displayName: string;
  fromBusinessName: string;
  fromBusinessEmail: string;
}): Promise<{ businessId: string; created: boolean } | { error: string }> {
  const user = await userService.getById(options.uid);
  let business =
    (user?.businessId
      ? await businessService.getById(user.businessId)
      : null) ?? (await businessService.getByOwnerId(options.uid));

  if (business) {
    return { businessId: business.id, created: false };
  }

  const businessName = resolveBusinessName(
    options.fromBusinessName,
    options.displayName,
    options.email,
  );
  if (!businessName) {
    return {
      error:
        "Add a business name in the From section (or set your account display name) before saving",
    };
  }

  const email = options.fromBusinessEmail.trim() || options.email.trim();
  if (!email) {
    return {
      error: "Add a business email in the From section before saving",
    };
  }

  business = await businessService.create({
    ownerId: options.uid,
    businessName,
    email,
    ...ONBOARDING_BUSINESS_DEFAULTS,
  });

  await userService.update(options.uid, { businessId: business.id });
  await settingsService.getByBusinessId(business.id);

  return { businessId: business.id, created: true };
}

export async function saveBuilderInvoiceAction(
  invoiceId: string | null,
  payload: BuilderSavePayload,
): Promise<BuilderInvoiceActionResult> {
  try {
    const context = await requireAuth();
    const clientName = payload.clientName.trim();
    if (!clientName) {
      return { success: false, error: "Add a client name before saving" };
    }
    if (!payload.items?.length) {
      return { success: false, error: "Add at least one line item" };
    }

    const ensured = await ensureBusinessForBuilderSave({
      uid: context.session.uid,
      email: context.session.email ?? context.user.email ?? "",
      displayName: context.session.name ?? context.user.displayName ?? "",
      fromBusinessName: payload.fromBusinessName,
      fromBusinessEmail: payload.fromBusinessEmail,
    });

    if ("error" in ensured) {
      return { success: false, error: ensured.error };
    }

    const { businessId, created } = ensured;

    if (!invoiceId) {
      const invoice = await invoiceService.createInvoice(businessId, {
        clientName,
        clientEmail: payload.clientEmail,
        clientAddress: payload.clientAddress,
        issueDate: payload.issueDate,
        dueDate: payload.dueDate,
        status: INVOICE_STATUSES.DRAFT,
        notes: payload.notes,
        items: payload.items,
        currency: payload.currency,
        templateId: payload.templateId,
        accent: payload.accent,
        stamp: payload.stamp,
      });

      revalidatePath(routes.invoices);
      return {
        success: true,
        data: serializeInvoice(invoice),
        createdBusiness: created,
        suggestedOnboarding: created,
      };
    }

    const updated = await invoiceService.updateInvoice(invoiceId, businessId, {
      clientName,
      clientEmail: payload.clientEmail,
      clientAddress: payload.clientAddress,
      issueDate: payload.issueDate,
      dueDate: payload.dueDate,
      notes: payload.notes,
      items: payload.items,
      templateId: payload.templateId,
      accent: payload.accent,
      stamp: payload.stamp ?? null,
    });

    revalidatePath(routes.invoices);
    revalidatePath(routes.invoice(invoiceId));
    return {
      success: true,
      data: serializeInvoice(updated),
      createdBusiness: false,
      suggestedOnboarding: false,
    };
  } catch (error) {
    console.error("[saveBuilderInvoiceAction]", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Could not save invoice",
    };
  }
}

/** Saved Account details used to prefill a new invoice's "from" block. */
export type BuilderBusinessDefaults = {
  name: string;
  address: string;
  email: string;
  phone: string;
  vatNumber: string;
  logoUrl: string;
  payment: {
    accountHolder: string;
    bankName: string;
    accountIban: string;
    sortSwift: string;
  };
};

export async function suggestNextInvoiceNumberAction(): Promise<
  | {
      success: true;
      invoiceNumber: string;
      businessDefaults?: BuilderBusinessDefaults;
    }
  | { success: false; error: string }
> {
  try {
    const context = await requireAuth();
    const user = await userService.getById(context.session.uid);
    const business =
      (user?.businessId
        ? await businessService.getById(user.businessId)
        : null) ?? (await businessService.getByOwnerId(context.session.uid));

    if (!business) {
      return {
        success: true,
        invoiceNumber: generateInvoiceNumber(
          ONBOARDING_BUSINESS_DEFAULTS.invoicePrefix,
          ONBOARDING_BUSINESS_DEFAULTS.invoiceStartingNumber,
        ),
      };
    }

    const next =
      business.invoiceNextNumber ?? business.invoiceStartingNumber;
    const address = [
      business.addressLine1,
      business.addressLine2,
      business.city,
      business.postcode,
    ]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(", ");
    return {
      success: true,
      invoiceNumber: generateInvoiceNumber(business.invoicePrefix, next),
      businessDefaults: {
        name: business.businessName ?? "",
        address,
        email: business.email ?? "",
        phone: business.phone ?? "",
        vatNumber: business.vatNumber ?? "",
        logoUrl: business.logoUrl ?? "",
        payment: {
          accountHolder: business.bankDetails?.accountName ?? "",
          bankName: business.bankDetails?.bankName ?? "",
          accountIban: business.bankDetails?.accountNumber ?? "",
          sortSwift: business.bankDetails?.sortCode ?? "",
        },
      },
    };
  } catch (error) {
    console.error("[suggestNextInvoiceNumberAction]", error);
    return { success: false, error: "Could not suggest invoice number" };
  }
}

export async function loadBuilderInvoiceAction(
  invoiceId: string,
): Promise<
  | { success: true; data: SerializedInvoice }
  | { success: false; error: string; notFound?: boolean }
> {
  try {
    const context = await requireAuth();
    const user = await userService.getById(context.session.uid);
    const business =
      (user?.businessId
        ? await businessService.getById(user.businessId)
        : null) ?? (await businessService.getByOwnerId(context.session.uid));

    if (!business) {
      return { success: false, error: "Invoice not found", notFound: true };
    }

    const invoice = await invoiceService.getInvoice(invoiceId, business.id);
    if (!invoice) {
      return { success: false, error: "Invoice not found", notFound: true };
    }

    return { success: true, data: serializeInvoice(invoice) };
  } catch (error) {
    console.error("[loadBuilderInvoiceAction]", error);
    return { success: false, error: "Could not load invoice" };
  }
}
