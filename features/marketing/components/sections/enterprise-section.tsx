"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { routes } from "@/config/routes";
import { MotionReveal } from "@/features/marketing/lib/motion-reveal";
import { MotionSection } from "@/features/marketing/lib/motion-section";

const points = [
  {
    title: "Easy from day 1",
    body: "No learning curve - create invoices, save customers, and get paid within minutes of opening SterlingSend.",
  },
  {
    title: "Guest Mode first",
    body: "Try the full invoice sheet without signing up. Create an account when you’re ready to save work.",
  },
  {
    title: "Human support",
    body: "Real help when you need it - from branding and bank details to Stripe payments setup.",
  },
];

export function EnterpriseSection() {
  return (
    <MotionSection className="py-20 sm:py-24">
      <div className="bonsai-container">
        <div className="bonsai-enterprise">
          <div className="max-w-xl">
            <p className="bonsai-eyebrow">Made for service businesses</p>
            <h2 className="bonsai-h2 mt-3">We’re here to make your switch swift</h2>
            <p className="bonsai-lead mt-4">
              Move from messy docs and spreadsheets to clean invoices, pay links,
              and a simple dashboard - without enterprise overhead.
            </p>
            <Link href={routes.features} className="bonsai-btn-secondary mt-8 inline-flex">
              Learn more
            </Link>
          </div>

          <ul className="space-y-5">
            {points.map((point, index) => (
              <MotionReveal key={point.title} delay={index * 0.06}>
                <li className="flex gap-3">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#0D9488]"
                    aria-hidden
                  />
                  <div>
                    <p className="font-semibold text-[#111827]">{point.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#6B7280]">
                      {point.body}
                    </p>
                  </div>
                </li>
              </MotionReveal>
            ))}
          </ul>
        </div>
      </div>
    </MotionSection>
  );
}
