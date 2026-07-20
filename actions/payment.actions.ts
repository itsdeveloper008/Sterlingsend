"use server";

import { revalidatePath } from "next/cache";
import { requireOnboarding } from "@/actions/auth.actions";
import { invoicePaymentService } from "@/services/invoice-payment.service";
import { stripeService } from "@/services/stripe.service";
import { invoiceService } from "@/services/invoice.service";
import { routes } from "@/config/routes";
import { INVOICE_STATUSES } from "@/types";

export type PaymentActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function ensureInvoicePublicLinkAction(
  invoiceId: string,
): Promise<PaymentActionResult<{ publicUrl: string; publicToken: string }>> {
  try {
    const { business } = await requireOnboarding();
    const result = await invoicePaymentService.ensurePublicLink(
      invoiceId,
      business.id,
    );
    revalidatePath(routes.invoice(invoiceId));
    return { success: true, data: result };
  } catch (error) {
    console.error("[ensureInvoicePublicLinkAction]", error);
    return { success: false, error: "Failed to create public link" };
  }
}

export async function markInvoiceSentAction(
  invoiceId: string,
): Promise<PaymentActionResult<{ publicUrl: string }>> {
  try {
    const { business } = await requireOnboarding();
    await invoiceService.updateInvoiceStatus(
      invoiceId,
      business.id,
      INVOICE_STATUSES.SENT,
    );
    const link = await invoicePaymentService.ensurePublicLink(
      invoiceId,
      business.id,
    );
    revalidatePath(routes.invoice(invoiceId));
    return { success: true, data: { publicUrl: link.publicUrl } };
  } catch (error) {
    console.error("[markInvoiceSentAction]", error);
    return { success: false, error: "Failed to mark invoice as sent" };
  }
}

export async function getStripeConnectionAction(): Promise<
  PaymentActionResult<{
    connected: boolean;
    enabled: boolean;
    accountId?: string;
    connectedAt?: string;
    environment: "test" | "live";
  }>
> {
  try {
    const { business } = await requireOnboarding();
    const summary = await stripeService.getConnectionSummary(business.id);
    return { success: true, data: summary };
  } catch (error) {
    console.error("[getStripeConnectionAction]", error);
    return { success: false, error: "Failed to load Stripe connection" };
  }
}

export async function createCheckoutSessionAction(
  publicToken: string,
): Promise<PaymentActionResult<{ url: string }>> {
  try {
    const result = await stripeService.createCheckoutSession(publicToken);
    return { success: true, data: { url: result.url } };
  } catch (error) {
    console.error("[createCheckoutSessionAction]", error);
    return { success: false, error: "Unable to start checkout" };
  }
}
