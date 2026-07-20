"use client";

import { ArrowRight, Download, FileEdit, UserPlus } from "lucide-react";
import Link from "next/link";
import { routes } from "@/config/routes";
import { marketingAnchors } from "@/features/marketing/lib/anchors";
import { MotionReveal } from "@/features/marketing/lib/motion-reveal";
import { MotionSection } from "@/features/marketing/lib/motion-section";

const steps = [
  {
    icon: FileEdit,
    title: "Create without an account",
    description:
      "Open Guest Mode, add your business and client details, and build your invoice in minutes.",
  },
  {
    icon: Download,
    title: "Download a professional PDF",
    description:
      "Preview your invoice and export a print-ready PDF - no signup, no credit card.",
  },
  {
    icon: UserPlus,
    title: "Save when you are ready",
    description:
      "Create a free account to store customers, accept online payments, and track status.",
  },
];

export function GuestModeSection() {
  return (
    <MotionSection
      id={marketingAnchors.guestMode}
      className="marketing-dark-section py-28 text-white sm:py-36 lg:py-44"
      aria-labelledby="guest-mode-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="guest-mode-heading" className="marketing-heading text-white">
            Guest Mode - try SterlingSend instantly
          </h2>
          <p className="marketing-body mt-5 text-slate-400">
            Three steps to your first invoice, no account required.
          </p>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <MotionReveal key={step.title} delay={index * 0.08}>
                <article className="marketing-guest-card h-full">
                  <div className="marketing-icon-circle">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="marketing-title mt-6 text-white">{step.title}</h3>
                  <p className="marketing-small mt-3 text-slate-400">{step.description}</p>
                </article>
              </MotionReveal>
            );
          })}
        </div>

        <div className="mt-16 flex justify-center">
          <Link href={routes.createInvoice} className="marketing-btn-primary">
            Create Free Invoice
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </MotionSection>
  );
}
