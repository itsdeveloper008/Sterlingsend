import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/features/marketing/components/marketing-shell";
import { VatCalculator } from "@/features/guides/components/vat-calculator";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "UK VAT calculator",
  description:
    "Add or remove UK VAT from a net or gross amount. Default rate 20 percent. Includes reverse VAT for checking.",
  alternates: { canonical: "/calculators/vat" },
};

export default function VatCalculatorPage() {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-24">
        <p className="text-sm font-medium text-[var(--brand-700)]">Calculator</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          UK VAT calculator
        </h1>
        <p className="mt-4 text-base text-[var(--body-text)]">
          Short answer: enter a net or gross amount, pick a VAT rate (20 percent
          is the default), and see the VAT and the other side of the figure.
          Reverse VAT starts from the gross total.
        </p>
        <VatCalculator />
        <p className="mt-8 text-sm text-[var(--secondary-text)]">
          Last updated: 22 October 2026. Rates and rules can change. Check{" "}
          <a
            className="underline underline-offset-2"
            href="https://www.gov.uk/vat-rates"
            rel="noopener noreferrer"
            target="_blank"
          >
            GOV.UK VAT rates
          </a>
          .
        </p>
        <Link
          href={routes.createInvoice}
          className="mt-8 inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-700)] px-5 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
        >
          Turn this into an invoice
        </Link>
        <p className="mt-4 text-xs text-[var(--secondary-text)]">
          {siteConfig.name} does not give tax advice.
        </p>
      </article>
    </MarketingShell>
  );
}
