"use client";

export type PaymentAnalyticsEvent =
  | "invoice_viewed"
  | "payment_started"
  | "checkout_opened"
  | "payment_completed"
  | "payment_failed"
  | "refund_issued";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackPaymentEvent(
  event: PaymentAnalyticsEvent,
  properties?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;

  const payload = {
    event,
    source: "payments",
    timestamp: new Date().toISOString(),
    ...properties,
  };

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
  window.dispatchEvent(
    new CustomEvent("valix:analytics", { detail: payload }),
  );

  if (process.env.NODE_ENV === "development") {
    console.info("[payment-analytics]", payload);
  }
}
