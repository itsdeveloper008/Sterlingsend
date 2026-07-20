import "server-only";

import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";

export function verifyWebhookSignature(
  body: string,
  signature: string,
  webhookSecret: string,
): Stripe.Event {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}
