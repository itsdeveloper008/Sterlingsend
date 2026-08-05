"use client";

import Link from "next/link";
import { FileStack, FileText } from "lucide-react";
import { routes } from "@/config/routes";
import { MotionReveal } from "@/features/marketing/lib/motion-reveal";
import { MotionSection } from "@/features/marketing/lib/motion-section";

const products = [
  {
    icon: FileText,
    title: "Invoicing",
    description:
      "Create branded invoices free. Log in later if you want saved customers, status tracking, and payments.",
    href: routes.createInvoice,
    cta: "Start invoicing",
  },
  {
    icon: FileStack,
    title: "PDF Toolkit",
    description:
      "Merge, split, compress, protect, convert, OCR, sign, and more, free in your browser with no login.",
    href: routes.tools,
    cta: "Explore PDF tools",
  },
];

export function ProductSwitcherSection() {
  return (
    <MotionSection className="border-y border-[#E5E7EB] bg-[#F8FAFC] py-14 sm:py-16">
      <div className="bonsai-container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="bonsai-eyebrow">Two products. Login optional.</p>
          <h2 className="bonsai-h2 mt-3">Pick your workflow</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {products.map((product, index) => {
            const Icon = product.icon;
            return (
              <MotionReveal key={product.title} delay={index * 0.06}>
                <Link
                  href={product.href}
                  className="group flex h-full flex-col rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition hover:border-primary/40 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="bonsai-h3 mt-5">{product.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#64748B]">
                    {product.description}
                  </p>
                  <span className="mt-5 text-sm font-semibold text-primary group-hover:underline">
                    {product.cta} →
                  </span>
                </Link>
              </MotionReveal>
            );
          })}
        </div>
      </div>
    </MotionSection>
  );
}
