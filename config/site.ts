import type { CurrencyCode } from "@/config/currencies";

export const siteConfig = {
  name: "SterlingSend",
  description:
    "Free UK invoice generator and 32 PDF tools. Create VAT invoices, download PDFs, and merge, compress or convert files. No login needed; sign up to save history.",
  /** Runtime app origin (local / preview). */
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  /** Public canonical / og / sitemap origin. */
  canonicalUrl: "https://sterlingsend.com",
  locale: "en-GB",
  defaultCurrency: "GBP" satisfies CurrencyCode,
  defaultVatRate: 20,
  defaultPaymentTermsDays: 30,
  supportEmail: "info@sterlingsend.com",
  logo: "/brand/sterlingsend-logo.png",
  logoAlt: "SterlingSend",
} as const;
