"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { routes } from "@/config/routes";
import { BrowserFrame } from "@/features/marketing/components/mockups/browser-frame";
import { DashboardMockup } from "@/features/marketing/components/mockups/dashboard-mockup";
import { InvoiceEditorMockup } from "@/features/marketing/components/mockups/invoice-editor-mockup";
import { PublicPayMockup } from "@/features/marketing/components/mockups/public-pay-mockup";
import { MotionSection } from "@/features/marketing/lib/motion-section";
import { cn } from "@/lib/utils";

type Showcase = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  chips: string[];
  mockup: "clients" | "invoices" | "payments";
};

const showcases: Showcase[] = [
  {
    id: "clients",
    eyebrow: "Client management",
    title: "Streamline your client workflow",
    description:
      "Manage leads and client details while delivering a clean billing experience - save once, reuse on every invoice.",
    cta: "Try SterlingSend for free",
    href: routes.createInvoice,
    chips: [
      "Customers",
      "Saved contacts",
      "Email & address",
      "Reuse on invoices",
      "Client portal link",
      "Status tracking",
    ],
    mockup: "clients",
  },
  {
    id: "invoices",
    eyebrow: "Invoice management",
    title: "Deliver invoices on time, every time",
    description:
      "Organize line items, VAT, discounts, and notes in one sheet your clients will love receiving.",
    cta: "Create free invoice",
    href: routes.createInvoice,
    chips: [
      "Guest Mode",
      "Line items",
      "VAT",
      "Discounts",
      "PDF export",
      "Branding",
      "Notes",
      "Bank details",
    ],
    mockup: "invoices",
  },
  {
    id: "payments",
    eyebrow: "Finance management",
    title: "Track revenue & simplify billing",
    description:
      "Get clarity with amount due, public pay links, Stripe Checkout, and bank transfer details on every invoice.",
    cta: "See how payments work",
    href: routes.features,
    chips: [
      "Invoicing",
      "Payments",
      "Pay links",
      "Stripe",
      "Bank details",
      "Amount due",
      "Paid / overdue",
    ],
    mockup: "payments",
  },
];

function MockupFor({ kind }: { kind: Showcase["mockup"] }) {
  if (kind === "clients") return <DashboardMockup />;
  if (kind === "payments") return <PublicPayMockup />;
  return <InvoiceEditorMockup />;
}

function ShowcaseBlock({
  showcase,
  reverse,
}: {
  showcase: Showcase;
  reverse?: boolean;
}) {
  const [activeChip, setActiveChip] = useState(0);
  const reduceMotion = useReducedMotion();

  return (
    <MotionSection
      className={cn(
        "bonsai-showcase-section py-16 sm:py-20",
        reverse ? "bg-[#F9FAFB]" : "bg-white",
      )}
    >
      <div className="bonsai-container">
        <p className="bonsai-eyebrow">{showcase.eyebrow}</p>

        <div
          className={cn(
            "mt-8 grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
            reverse && "lg:[&>*:first-child]:order-2",
          )}
        >
          <div>
            <div className="bonsai-chip-row">
              {showcase.chips.map((chip, index) => (
                <button
                  key={chip}
                  type="button"
                  className={cn(
                    "bonsai-chip",
                    index === activeChip && "bonsai-chip--active",
                  )}
                  onClick={() => setActiveChip(index)}
                >
                  {chip}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${showcase.id}-${activeChip}`}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
              >
                <h2 className="bonsai-h2 mt-6 max-w-lg">{showcase.title}</h2>
                <p className="bonsai-lead mt-4 max-w-lg">
                  {showcase.description}
                  {activeChip > 0 ? (
                    <>
                      {" "}
                      Focus on{" "}
                      <span className="font-semibold text-[#111827]">
                        {showcase.chips[activeChip]}
                      </span>
                      .
                    </>
                  ) : null}
                </p>
              </motion.div>
            </AnimatePresence>

            <Link
              href={showcase.href}
              className="bonsai-btn-primary mt-8 inline-flex"
            >
              {showcase.cta}
            </Link>
          </div>

          <motion.div
            className="bonsai-showcase-visual"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: [0, 0, 0.2, 1] }}
          >
            <BrowserFrame
              url={
                showcase.mockup === "payments"
                  ? "pay.sterlingsend.com"
                  : "app.sterlingsend.com"
              }
            >
              <MockupFor kind={showcase.mockup} />
            </BrowserFrame>
          </motion.div>
        </div>
      </div>
    </MotionSection>
  );
}

export function FeatureTabsSection() {
  return (
    <div>
      {showcases.map((showcase, index) => (
        <ShowcaseBlock
          key={showcase.id}
          showcase={showcase}
          reverse={index % 2 === 1}
        />
      ))}
    </div>
  );
}
