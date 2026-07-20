import "server-only";

import Stripe from "stripe";
import { validateStripeKeys } from "@/lib/stripe/config";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  validateStripeKeys();

  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY!;
    stripeClient = new Stripe(secretKey, {
      typescript: true,
    });
  }
  return stripeClient;
}
