import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/features/marketing/components/marketing-shell";
import { routes } from "@/config/routes";

export const metadata: Metadata = {
  title: "What must be on a UK invoice",
  description:
    "Checklist of what commonly belongs on a UK business invoice, from VAT numbers to payment terms, with links to official GOV.UK guidance. Not tax advice.",
  alternates: { canonical: "/guides/what-must-be-on-a-uk-invoice" },
};

const CHECKS = [
  "Unique invoice number",
  "Your business name and address",
  "Client name and address",
  "Invoice date",
  "Description of goods or services",
  "Quantity and unit price where relevant",
  "VAT amount and rate if you are VAT registered",
  "Your VAT number if registered",
  "Total amount due and currency",
  "Payment terms or due date",
];

export default function UkInvoiceGuidePage() {
  return (
    <MarketingShell showScrollProgress>
      <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-24">
        <p className="text-sm font-medium text-[var(--brand-700)]">Guide</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          What must be on a UK invoice
        </h1>
        <p className="mt-4 text-base text-[var(--body-text)]">
          Short answer: a clear UK invoice usually shows who you are, who you
          are billing, what you supplied, when, how much is due, and VAT details
          if you are registered. Exact rules depend on your situation.
        </p>
        <h2 className="mt-10 text-lg font-semibold text-foreground">
          Checklist
        </h2>
        <ul className="mt-4 space-y-2">
          {CHECKS.map((item) => (
            <li key={item} className="flex gap-2 text-[var(--body-text)]">
              <span aria-hidden className="text-[var(--brand-700)]">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-[var(--secondary-text)]">
          Source:{" "}
          <a
            className="underline underline-offset-2"
            href="https://www.gov.uk/invoicing-and-taking-payment-from-customers/invoices-what-they-must-include"
            rel="noopener noreferrer"
            target="_blank"
          >
            GOV.UK invoices: what they must include
          </a>
          . Last updated: 22 October 2026.
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
