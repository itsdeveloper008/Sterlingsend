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
    <section className="bg-white px-4 py-24 dark:bg-[#0B1220] sm:px-6">
      <div className="mx-auto w-full max-w-[760px]">
        <MotionReveal>
          <h2 className="font-[family-name:var(--font-display)] text-[40px] font-bold leading-tight text-[#0F172A] dark:text-white">
            Questions
          </h2>
          <p className="mt-3 text-base text-[#475569] dark:text-[#CBD5E1]">
            Short answers about how the product works today.
          </p>
        </MotionReveal>
        <MotionReveal delayMs={60}>
          <div className="mt-8 divide-y divide-[#CBD5E1] border-y border-[#CBD5E1] dark:divide-[#334155] dark:border-[#334155]">
            {FAQS.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="cursor-pointer list-none text-[19px] font-bold text-[#0F172A] marker:content-none dark:text-white">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span
                      aria-hidden
                      className="text-[#475569] transition-transform duration-150 group-open:rotate-45"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-base leading-relaxed text-[#475569] dark:text-[#CBD5E1]">
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
