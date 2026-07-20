export const siteConfig = {
  name: "SterlingSend",
  description:
    "The easiest and fastest way for UK businesses to create invoices and get paid.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  locale: "en-GB",
  defaultCurrency: "GBP",
  defaultVatRate: 20,
  defaultPaymentTermsDays: 30,
  supportEmail: "support@sterlingsend.com",
  logo: "/brand/sterlingsend-logo.png",
  logoAlt: "SterlingSend",
} as const;
