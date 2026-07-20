import "server-only";

import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import { getStripe } from "@/lib/stripe/server";
import { getStripeMode, validateStripeKeys } from "@/lib/stripe/config";
import { toStripeAmount } from "@/lib/stripe/utils";
import { verifyWebhookSignature } from "@/lib/stripe/webhook";
import { invoicePaymentService } from "@/services/invoice-payment.service";
import { paymentService } from "@/services/payment.service";
import { settingsService } from "@/services/settings.service";
import type { StripeCheckoutSessionResult } from "@/types";
import { PAYMENT_STATUSES } from "@/types";
import type Stripe from "stripe";

export class StripeService {
  async getConnectionSummary(businessId: string) {
    const settings = await settingsService.getByBusinessId(businessId);
    const configured = Boolean(process.env.STRIPE_SECRET_KEY);
    const environment = getStripeMode();

    if (!configured) {
      return {
        connected: false,
        enabled: settings.stripe?.enabled ?? false,
        accountId: settings.stripe?.accountId,
        connectedAt: settings.stripe?.connectedAt,
        environment,
      };
    }

    let accountId = settings.stripe?.accountId;
    if (!accountId && process.env.STRIPE_ACCOUNT_ID) {
      accountId = process.env.STRIPE_ACCOUNT_ID;
      await settingsService.update(businessId, {
        stripe: {
          ...settings.stripe,
          enabled: true,
          accountId,
          connectedAt: settings.stripe?.connectedAt ?? new Date().toISOString(),
          environment,
        },
      });
    }

    return {
      connected: true,
      enabled: settings.stripe?.enabled ?? true,
      accountId,
      connectedAt: settings.stripe?.connectedAt,
      environment,
    };
  }

  async createCheckoutSession(
    publicToken: string,
  ): Promise<StripeCheckoutSessionResult> {
    const invoice = await invoicePaymentService.getInvoiceByPublicToken(publicToken);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const view = await invoicePaymentService.buildPublicInvoiceView(publicToken);
    if (!view?.canPay) {
      throw new Error("Invoice is not payable");
    }

    const existingPending = await paymentService.getByInvoiceId(invoice.id);
    if (
      existingPending &&
      existingPending.status === PAYMENT_STATUSES.PENDING &&
      existingPending.stripeSessionId
    ) {
      const stripe = getStripe();
      const existingSession = await stripe.checkout.sessions.retrieve(
        existingPending.stripeSessionId,
      );
      if (existingSession.url && existingSession.status === "open") {
        return {
          sessionId: existingSession.id,
          url: existingSession.url,
          paymentId: existingPending.id,
        };
      }
    }

    const stripe = getStripe();
    const baseUrl = siteConfig.url.replace(/\/$/, "");
    const successUrl = `${baseUrl}${routes.publicInvoice(publicToken)}?payment=success`;
    const cancelUrl = `${baseUrl}${routes.publicInvoice(publicToken)}?payment=cancelled`;

    const payment = await paymentService.createPayment({
      businessId: invoice.businessId,
      invoiceId: invoice.id,
      stripeSessionId: "pending",
      stripePaymentIntentId: undefined,
      amount: invoice.totals.total,
      currency: invoice.currency,
      status: PAYMENT_STATUSES.PENDING,
      customerEmail: invoice.clientEmail,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: invoice.clientEmail || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: invoice.currency.toLowerCase(),
            unit_amount: toStripeAmount(invoice.totals.total),
            product_data: {
              name: `Invoice ${invoice.invoiceNumber}`,
              description: `Payment for ${invoice.clientName}`,
            },
          },
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        paymentId: payment.id,
        invoiceId: invoice.id,
        businessId: invoice.businessId,
        publicToken,
      },
    });

    await paymentService.updatePayment(payment.id, {
      stripeSessionId: session.id,
    });

    await invoicePaymentService.markPaymentPending(invoice.id, invoice.businessId);

    if (!session.url) {
      throw new Error("Stripe checkout session missing URL");
    }

    return {
      sessionId: session.id,
      url: session.url,
      paymentId: payment.id,
    };
  }

  verifyWebhookSignature(body: string, signature: string, secret: string) {
    validateStripeKeys({ requireWebhook: true });
    return verifyWebhookSignature(body, signature, secret);
  }

  async processWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutCompleted(event);
        break;
      case "payment_intent.succeeded":
        await this.handlePaymentIntentSucceeded(event);
        break;
      case "payment_intent.payment_failed":
        await this.handlePaymentIntentFailed(event);
        break;
      case "charge.refunded":
        await this.handleChargeRefunded(event);
        break;
      default:
        break;
    }
  }

  private async handleCheckoutCompleted(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentId = session.metadata?.paymentId;
    const invoiceId = session.metadata?.invoiceId;
    const businessId = session.metadata?.businessId;

    if (!paymentId || !invoiceId || !businessId) return;

    const shouldProcess = await paymentService.appendWebhookEventId(
      paymentId,
      event.id,
    );
    if (!shouldProcess) return;

    await paymentService.updatePayment(paymentId, {
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id,
      customerEmail: session.customer_details?.email ?? undefined,
      status: PAYMENT_STATUSES.PAID,
      paidAt: new Date(),
    });

    await invoicePaymentService.markPaymentSucceeded(
      invoiceId,
      businessId,
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? "",
    );
  }

  private async handlePaymentIntentSucceeded(event: Stripe.Event) {
    const intent = event.data.object as Stripe.PaymentIntent;
    const paymentId = intent.metadata?.paymentId;
    const invoiceId = intent.metadata?.invoiceId;
    const businessId = intent.metadata?.businessId;

    if (!paymentId) {
      const payment = await this.findPaymentByIntent(intent.id);
      if (!payment) return;
      await this.finalizePaidPayment(payment.id, payment.invoiceId, payment.businessId, intent.id, event.id);
      return;
    }

    await this.finalizePaidPayment(paymentId, invoiceId!, businessId!, intent.id, event.id);
  }

  private async handlePaymentIntentFailed(event: Stripe.Event) {
    const intent = event.data.object as Stripe.PaymentIntent;
    const payment = intent.metadata?.paymentId
      ? { id: intent.metadata.paymentId, invoiceId: intent.metadata.invoiceId, businessId: intent.metadata.businessId }
      : await this.findPaymentByIntent(intent.id);

    if (!payment?.invoiceId || !payment.businessId) return;

    const shouldProcess = await paymentService.appendWebhookEventId(
      payment.id,
      event.id,
    );
    if (!shouldProcess) return;

    await paymentService.updatePaymentStatus(payment.id, PAYMENT_STATUSES.FAILED, {
      stripePaymentIntentId: intent.id,
      failureMessage: intent.last_payment_error?.message,
    });

    await invoicePaymentService.markPaymentFailed(
      payment.invoiceId,
      payment.businessId,
    );
  }

  private async handleChargeRefunded(event: Stripe.Event) {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id;

    if (!paymentIntentId) return;

    const payment = await this.findPaymentByIntent(paymentIntentId);
    if (!payment) return;

    const shouldProcess = await paymentService.appendWebhookEventId(
      payment.id,
      event.id,
    );
    if (!shouldProcess) return;

    await paymentService.updatePaymentStatus(payment.id, PAYMENT_STATUSES.REFUNDED, {
      refundedAt: new Date(),
    });

    await invoicePaymentService.markPaymentRefunded(
      payment.invoiceId,
      payment.businessId,
    );
  }

  private async finalizePaidPayment(
    paymentId: string,
    invoiceId: string,
    businessId: string,
    paymentIntentId: string,
    eventId: string,
  ) {
    const shouldProcess = await paymentService.appendWebhookEventId(
      paymentId,
      eventId,
    );
    if (!shouldProcess) return;

    await paymentService.updatePayment(paymentId, {
      status: PAYMENT_STATUSES.PAID,
      stripePaymentIntentId: paymentIntentId,
      paidAt: new Date(),
    });

    await invoicePaymentService.markPaymentSucceeded(
      invoiceId,
      businessId,
      paymentIntentId,
    );
  }

  private async findPaymentByIntent(paymentIntentId: string) {
    const payment = await paymentService.getByPaymentIntentId(paymentIntentId);
    if (payment) {
      return {
        id: payment.id,
        invoiceId: payment.invoiceId,
        businessId: payment.businessId,
      };
    }

    const stripe = getStripe();
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntentId,
      limit: 1,
    });

    const session = sessions.data[0];
    if (!session?.metadata?.paymentId) return null;

    return {
      id: session.metadata.paymentId,
      invoiceId: session.metadata.invoiceId!,
      businessId: session.metadata.businessId!,
    };
  }
}

export const stripeService = new StripeService();
