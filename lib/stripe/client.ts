"use client";

export type StripeClientMode = "test" | "live" | "unconfigured";

export function getClientStripeMode(): StripeClientMode {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

  if (!publishableKey) return "unconfigured";
  if (publishableKey.startsWith("pk_test_")) return "test";
  if (publishableKey.startsWith("pk_live_")) return "live";
  return "unconfigured";
}

export function isClientStripeTestMode() {
  return getClientStripeMode() === "test";
}
