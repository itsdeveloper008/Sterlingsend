"use client";

import { ProductMockupFrame } from "@/features/marketing/components/mockups/product-mockup-frame";
import { marketingAnchors } from "@/features/marketing/lib/anchors";
import { MotionReveal } from "@/features/marketing/lib/motion-reveal";
import { MotionSection } from "@/features/marketing/lib/motion-section";

const showcases = [
  {
    title: "Invoice builder",
    description: "Add line items, VAT, and customer details in a clean editor.",
    src: "/marketing/mockup-hero-invoice.svg",
    alt: "SterlingSend invoice builder",
    width: 680,
    height: 480,
    url: "sterlingsend.com/create-invoice",
  },
  {
    title: "Dashboard & tracking",
    description: "See what is paid, pending, and overdue at a glance.",
    src: "/marketing/mockup-dashboard.svg",
    alt: "SterlingSend dashboard",
    width: 640,
    height: 400,
    url: "sterlingsend.com/dashboard",
    reverse: true,
  },
  {
    title: "Get paid online",
    description: "Clients pay via Stripe Checkout on a branded public invoice page.",
    src: "/marketing/mockup-payment.svg",
    alt: "SterlingSend payment page",
    width: 640,
    height: 360,
    url: "sterlingsend.com/i/...",
  },
  {
    title: "Professional PDF export",
    description: "Print-ready PDFs with UK-friendly formatting in one click.",
    src: "/marketing/mockup-pdf.svg",
    alt: "SterlingSend PDF export",
    width: 640,
    height: 400,
    url: "sterlingsend.com/pdf",
    reverse: true,
  },
];

export function ProductShowcaseSection() {
  return (
    <MotionSection
      id={marketingAnchors.features}
      className="bg-white py-24 sm:py-32"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="features-heading" className="marketing-heading text-[#0F172A]">
            Everything you need to get paid
          </h2>
          <p className="marketing-body mt-4">
            From first draft to payment - designed for speed, not complexity.
          </p>
        </div>

        <div className="mt-20 space-y-24 lg:space-y-32">
          {showcases.map((item, index) => (
            <MotionReveal key={item.title} delay={index * 0.05}>
              <article
                className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-20 ${
                  item.reverse ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="max-w-md lg:max-w-none">
                  <h3 className="marketing-title text-[#0F172A]">{item.title}</h3>
                  <p className="marketing-body mt-3">{item.description}</p>
                </div>
                <ProductMockupFrame
                  src={item.src}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  url={item.url}
                />
              </article>
            </MotionReveal>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}
