import type { CurrencyCode } from "@/config/currencies";

export const siteConfig = {
  name: "SterlingSend",
  description:
    "Create UK invoices and use PDF tools free. Log in only if you want saved invoice history.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  locale: "en-GB",
  defaultCurrency: "GBP" satisfies CurrencyCode,
  defaultVatRate: 20,
  defaultPaymentTermsDays: 30,
  supportEmail: "support@sterlingsend.com",
  logo: "/brand/sterlingsend-logo.png",
  logoAlt: "SterlingSend",
} as const;
