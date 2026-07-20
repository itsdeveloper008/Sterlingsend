import { randomBytes } from "crypto";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";

export {
  getStripeMode,
  isStripeTestMode,
  isStripeLiveMode,
  validateStripeKeys,
} from "@/lib/stripe/config";

export function generatePublicToken() {
  return randomBytes(32).toString("base64url");
}

export function buildPublicInvoiceUrl(publicToken: string) {
  const base = siteConfig.url.replace(/\/$/, "");
  return `${base}${routes.publicInvoice(publicToken)}`;
}

export function toStripeAmount(amount: number) {
  return Math.round(amount * 100);
}
