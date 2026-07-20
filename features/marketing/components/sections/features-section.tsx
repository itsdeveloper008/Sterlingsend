"use client";

import {
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  Package,
  Users,
} from "lucide-react";
import { marketingAnchors } from "@/features/marketing/lib/anchors";
import { MotionReveal } from "@/features/marketing/lib/motion-reveal";
import { MotionSection } from "@/features/marketing/lib/motion-section";

const features = [
  {
    icon: FileText,
    title: "Professional PDF export",
    description: "Print-ready SterlingSend Classic template built for UK businesses.",
  },
  {
    icon: ClipboardList,
    title: "Invoice tracking",
    description: "Know when invoices are sent, viewed, paid, or overdue.",
  },
  {
    icon: Users,
    title: "Customer management",
    description: "Save client details once and reuse them on every invoice.",
  },
  {
    icon: CreditCard,
    title: "Online payments",
    description: "Stripe Checkout - secure card payments, no account for clients.",
  },
  {
    icon: Package,
    title: "Saved services",
    description: "Store products and services for one-click line items.",
  },
  {
    icon: Building2,
    title: "Business profiles",
    description: "Your logo, address, and branding on every invoice you send.",
  },
];

export function FeaturesSection() {
  return (
    <MotionSection
      id={marketingAnchors.scope}
      className="bg-[#FAFAFA] py-24 sm:py-32"
      aria-labelledby="scope-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="scope-heading" className="marketing-heading text-[#0F172A]">
            Built for invoicing - nothing else
          </h2>
          <p className="marketing-body mt-4">
            Not accounting software. Not a CRM. Just create, send, and get paid.
          </p>
        </div>

        <ul className="mt-16 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <li key={feature.title}>
                <MotionReveal delay={index * 0.06}>
                  <div className="marketing-outline-card h-full">
                    <div className="marketing-icon-circle">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="marketing-title mt-5 text-[#0F172A]">{feature.title}</h3>
                    <p className="marketing-small mt-2">{feature.description}</p>
                  </div>
                </MotionReveal>
              </li>
            );
          })}
        </ul>
      </div>
    </MotionSection>
  );
}
