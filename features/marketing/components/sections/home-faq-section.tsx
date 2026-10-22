"use client";

import { siteConfig } from "@/config/site";
import { MotionReveal } from "@/features/marketing/lib/motion-reveal";

const FAQS = [
  {
    q: "Is SterlingSend free?",
    a: "Yes. Creating invoices, downloading PDFs, browsing templates and using the PDF tools does not require payment. There is no paid plan yet.",
  },
  {
    q: "Do I need an account?",
    a: "No. Guests can build invoices and run PDF tools without signing in.",
  },
  {
    q: "What does logging in add?",
    a: "A logged-in account can save invoice history so you can find past invoices later. Tools and the invoice builder still work without an account.",
  },
  {
    q: "What tax and currency defaults does it use?",
    a: `New invoices default to ${siteConfig.defaultCurrency}, ${siteConfig.defaultVatRate}% VAT and Net ${siteConfig.defaultPaymentTermsDays}. You can change these on the invoice.`,
  },
  {
    q: "Where do my files go?",
    a: "Most PDF tools process files in your browser and do not upload them. Translate PDF sends extracted text to a translation service after you confirm. OCR may download language data to your browser on first use.",
  },
  {
    q: "How do I contact you?",
    a: `Email ${siteConfig.supportEmail}. We read every message.`,
  },
] as const;

export function HomeFaqSection() {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <MotionReveal>
          <h2 className="type-h2 text-foreground">Questions</h2>
          <p className="mt-2 text-muted-foreground">
            Short answers about how the product works today.
          </p>
        </MotionReveal>
        <MotionReveal delayMs={60}>
          <div className="mt-8 divide-y divide-border-subtle border-y border-border-subtle">
            {FAQS.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground marker:content-none">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span
                      aria-hidden
                      className="text-muted-foreground transition-transform duration-[var(--duration-150)] group-open:rotate-45"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
