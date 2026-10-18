/**
 * Launch gate for Stripe payment UI.
 * Default false until payments are tested in live mode.
 * Set PAYMENTS_ENABLED=true (or NEXT_PUBLIC_PAYMENTS_ENABLED=true) to re-enable.
 */
export function isPaymentsEnabled(): boolean {
  const server = process.env.PAYMENTS_ENABLED;
  const pub = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED;
  const raw = server ?? pub ?? "false";
  return raw === "1" || raw.toLowerCase() === "true";
}
