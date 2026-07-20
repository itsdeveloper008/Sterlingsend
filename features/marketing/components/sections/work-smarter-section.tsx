"use client";

import Link from "next/link";
import { BarChart3, Sparkles, Workflow } from "lucide-react";
import { routes } from "@/config/routes";
import { MotionReveal } from "@/features/marketing/lib/motion-reveal";
import { MotionSection } from "@/features/marketing/lib/motion-section";

const items = [
  {
    icon: Workflow,
    title: "Automations",
    description:
      "Save time with drafts that autosave, reusable customers, and one-click PDF export.",
  },
  {
    icon: BarChart3,
    title: "Clarity",
    description:
      "See what’s outstanding and paid without digging through spreadsheets.",
  },
  {
    icon: Sparkles,
    title: "Works with Stripe",
    description:
      "Share a public pay link and collect card payments securely when you’re ready.",
  },
];

export function WorkSmarterSection() {
  return (
    <MotionSection className="py-20 sm:py-24">
      <div className="bonsai-container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="bonsai-h2">Work smarter by keeping everything in one place</h2>
          <p className="bonsai-lead mt-4">
            Invoicing, clients, and payments - without the all-in-one bloat.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <MotionReveal key={item.title} delay={index * 0.06}>
                <article className="bonsai-pillar">
                  <div className="bonsai-pillar-icon">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="bonsai-h3 mt-5">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                    {item.description}
                  </p>
                </article>
              </MotionReveal>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href={routes.createInvoice} className="bonsai-btn-primary">
            Try SterlingSend for free
          </Link>
        </div>
      </div>
    </MotionSection>
  );
}
