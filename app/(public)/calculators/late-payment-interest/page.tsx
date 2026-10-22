import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/features/marketing/components/marketing-shell";
import { LateInterestCalculator } from "@/features/guides/components/late-interest-calculator";
import { routes } from "@/config/routes";

export const metadata: Metadata = {
  title: "Late payment interest calculator",
  description:
    "Estimate UK statutory interest and fixed compensation under the Late Payment of Commercial Debts Act. Enter the Bank of England base rate that applies.",
  alternates: { canonical: "/calculators/late-payment-interest" },
};

export default function LatePaymentInterestPage() {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-24">
        <p className="text-sm font-medium text-[var(--brand-700)]">Calculator</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Late payment interest calculator
        </h1>
        <p className="mt-4 text-base text-[var(--body-text)]">
          Short answer: for many business-to-business debts in the UK, you can
          claim statutory interest at the Bank of England base rate plus 8
          percent, plus a fixed compensation amount that depends on the size of
          the debt.
        </p>
        <LateInterestCalculator />
        <p className="mt-8 text-sm text-[var(--secondary-text)]">
          Last updated: 22 October 2026. This is a working estimate, not legal
          advice. Confirm eligibility and the correct reference rate on GOV.UK.
        </p>
        <Link
          href={routes.createInvoice}
          className="mt-8 inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-700)] px-5 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
        >
          Turn this into an invoice
        </Link>
      </article>
    </MarketingShell>
  );
}
