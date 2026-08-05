"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { marketingAnchors } from "@/features/marketing/lib/anchors";
import { MotionSection } from "@/features/marketing/lib/motion-section";

const faqs = [
  {
    q: "Do I need an account?",
    a: "No. Create invoices and use every PDF tool free without signing up. Create an account only when you want to save invoices, customers, and payment history.",
  },
  {
    q: "Are PDF tools free without login?",
    a: "Yes. Open /tools and use merge, split, compress, convert, OCR, sign, protect, and more in your browser. Files stay on your device. Login is optional and only for saving account data.",
  },
  {
    q: "How does guest invoicing work?",
    a: "Open Create Invoice, add your business and client details, then download or print a PDF immediately. Sign up later if you want saved customers and tracked invoices.",
  },
  {
    q: "Can my clients pay online?",
    a: "Yes. When you send an invoice from a saved account, clients open a public link and pay securely via Stripe Checkout. They do not need a SterlingSend account.",
  },
  {
    q: "Is SterlingSend accounting software?",
    a: "No. SterlingSend is lightweight invoicing and PDF tooling focused on creating professional documents and getting paid. It is not an ERP, CRM, payroll, or inventory system.",
  },
  {
    q: "Is it suitable for UK businesses?",
    a: "Yes. SterlingSend is built for UK freelancers, consultants, agencies, and small businesses. Invoices use GBP, en-GB formatting, 20% VAT by default, and Net 30 payment terms.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();
  const reduceMotion = useReducedMotion();

  function toggle(index: number) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  return (
    <MotionSection
      id={marketingAnchors.faq}
      className="bg-white py-24 sm:py-32"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 id="faq-heading" className="marketing-heading text-[#0F172A]">
            Frequently asked questions
          </h2>
          <p className="marketing-body mt-4">
            Everything you need to know before your first invoice.
          </p>
        </div>

        <div className="mt-14">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-button-${index}`;

            return (
              <div key={faq.q} className="marketing-faq-item">
                <button
                  id={buttonId}
                  type="button"
                  className="marketing-faq-trigger flex w-full items-center justify-between gap-6 py-6 text-left"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span className="marketing-title text-[#0F172A]">{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-[#64748B] transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={false}
                  animate={
                    reduceMotion
                      ? { height: isOpen ? "auto" : 0 }
                      : {
                          height: isOpen ? "auto" : 0,
                          opacity: isOpen ? 1 : 0,
                        }
                  }
                  transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="marketing-small pb-6 pr-8">{faq.a}</p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </MotionSection>
  );
}
