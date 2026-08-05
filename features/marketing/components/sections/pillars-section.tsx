"use client";

import { CreditCard, FileText, Users } from "lucide-react";
import { MotionReveal } from "@/features/marketing/lib/motion-reveal";
import { MotionSection } from "@/features/marketing/lib/motion-section";

const pillars = [
  {
    icon: Users,
    title: "Client management",
    description:
      "Everything you need to save client details, reuse them on invoices, and keep relationships organised.",
  },
  {
    icon: FileText,
    title: "Invoice management",
    description:
      "Create, preview, and export professional PDFs with VAT, discounts, notes, and branding.",
  },
  {
    icon: CreditCard,
    title: "Finance & payments",
    description:
      "Share a public pay link, collect card payments via Stripe, and show bank details when needed.",
  },
];

export function PillarsSection() {
  return (
    <MotionSection className="py-20 sm:py-24">
      <div className="bonsai-container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="bonsai-h2">Invoicing that stays simple</h2>
          <p className="bonsai-lead mt-4">
            Clients, invoices, and payments in one place, then jump into PDF
            tools whenever you need them.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <MotionReveal key={pillar.title} delay={index * 0.06}>
                <article className="bonsai-pillar">
                  <div className="bonsai-pillar-icon">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="bonsai-h3 mt-5">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                    {pillar.description}
                  </p>
                </article>
              </MotionReveal>
            );
          })}
        </div>
      </div>
    </MotionSection>
  );
}
