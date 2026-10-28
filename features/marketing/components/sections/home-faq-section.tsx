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

/** Server section; MotionReveal is the only client island. */
export function HomeFaqSection() {
  return (
    <section className="ss-section bg-white px-4 sm:px-6">
      <div className="mx-auto w-full max-w-[760px]">
        <MotionReveal>
          <h2 className="type-h2">Questions</h2>
          <p className="ss-measure mt-6 text-[17px] leading-[1.7] text-[var(--secondary-text)]">
            Short answers about how the product works today.
          </p>
        </MotionReveal>
        <MotionReveal delayMs={80}>
          <div className="mt-10 border-t border-[#E2E8F0]">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="group border-b border-[#E2E8F0] py-5"
              >
                <summary className="cursor-pointer list-none text-[18px] font-semibold text-[var(--ink)] marker:content-none hover:text-[var(--brand-700)]">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span
                      aria-hidden
                      className="text-[var(--secondary-text)] transition-transform duration-[var(--duration-300)] group-open:rotate-45"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="ss-measure mt-4 text-[17px] leading-[1.7] text-[var(--secondary-text)]">
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
