export type GuestAnalyticsEvent =
  | "guest_invoice_started"
  | "guest_invoice_completed"
  | "guest_pdf_downloaded"
  | "guest_pdf_printed"
  | "guest_account_conversion_clicked";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackGuestEvent(
  event: GuestAnalyticsEvent,
  properties?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;

  const payload = {
    event,
    source: "guest_mode",
    timestamp: new Date().toISOString(),
    ...properties,
  };

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);

  window.dispatchEvent(
    new CustomEvent("valix:analytics", {
      detail: payload,
    }),
  );

  if (process.env.NODE_ENV === "development") {
    console.info("[guest-analytics]", payload);
  }
}
