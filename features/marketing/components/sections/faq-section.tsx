"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { marketingAnchors } from "@/features/marketing/lib/anchors";
import { MotionSection } from "@/features/marketing/lib/motion-section";

const faqs = [
  {
    q: "Do I need an account to create an invoice?",
    a: "No. Guest Mode lets you create, preview, download, and print invoices at /create-invoice without signing up. Your draft is stored in your browser via localStorage. Create a free account when you are ready to save invoices, customers, and accept online payments.",
  },
  {
    q: "How does Guest Mode work?",
    a: "Open Create Invoice, add your business and client details, then preview and export a PDF at /invoice-preview. You can download or print immediately. If you sign up later, your guest invoice can be carried into onboarding automatically.",
  },
  {
    q: "Can my clients pay online?",
    a: "Yes. When you send an invoice from your account, clients open a public link at /i/[token] and pay securely via Stripe Checkout. They do not need a SterlingSend account. Payments are processed in Stripe test mode during development.",
  },
  {
    q: "Is SterlingSend accounting software?",
    a: "No. SterlingSend is lightweight invoicing software focused on creating professional PDFs, managing customers, and getting paid. It is not an ERP, CRM, payroll, or inventory system.",
  },
  {
    q: "Is it suitable for UK businesses?",
    a: "Yes. SterlingSend is built for UK freelancers, consultants, agencies, and small businesses. Invoices use GBP, en-GB formatting, 20% VAT by default, and Net 30 payment terms.",
  },
  {
    q: "What happens to my guest invoice if I sign up?",
    a: "After downloading your PDF, create a free account. Your guest invoice data can seed onboarding so you do not have to re-enter business details. Guest validation and PDF rate limits apply on public routes.",
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
