"use client";

import { marketingAnchors } from "@/features/marketing/lib/anchors";
import { MotionReveal } from "@/features/marketing/lib/motion-reveal";
import { MotionSection } from "@/features/marketing/lib/motion-section";

const steps = [
  {
    number: "01",
    title: "Create",
    description:
      "Add your business details, pick a customer, and add line items - Guest Mode works without an account.",
  },
  {
    number: "02",
    title: "Send",
    description:
      "Share a public payment link or download a PDF. Your client gets a clean, professional invoice.",
  },
  {
    number: "03",
    title: "Get paid",
    description:
      "Clients pay online via Stripe. Track status from sent to viewed to paid.",
  },
];

export function HowItWorksSection() {
  return (
    <MotionSection
      id={marketingAnchors.howItWorks}
      className="bg-white py-24 sm:py-32"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="how-it-works-heading" className="marketing-heading text-[#0F172A]">
            How it works
          </h2>
          <p className="marketing-body mt-4">Three steps. No training required.</p>
        </div>

        <ol className="mt-16 grid list-none gap-6 lg:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.number}>
              <MotionReveal delay={index * 0.08}>
                <div className="marketing-outline-card h-full">
                  <span className="marketing-step-number" aria-hidden>
                    {step.number}
                  </span>
                  <h3 className="marketing-title mt-4 text-[#0F172A]">{step.title}</h3>
                  <p className="marketing-small mt-3">{step.description}</p>
                </div>
              </MotionReveal>
            </li>
          ))}
        </ol>
      </div>
    </MotionSection>
  );
}
