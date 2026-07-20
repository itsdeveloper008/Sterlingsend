"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { routes } from "@/config/routes";
import { MotionSection } from "@/features/marketing/lib/motion-section";
import { cn } from "@/lib/utils";

const roles = [
  {
    id: "owners",
    label: "Owners",
    title: "Keep sales and cashflow in check",
    body: "See what’s outstanding, what’s paid, and what’s overdue - with less spreadsheet chasing.",
  },
  {
    id: "ops",
    label: "Operations",
    title: "Standardise how invoices go out",
    body: "Consistent PDFs, saved services, and customer records so the team bills the same way every time.",
  },
  {
    id: "freelancers",
    label: "Freelancers",
    title: "Invoice without the learning curve",
    body: "Guest Mode gets you a professional PDF in minutes. Create an account when you want to save work.",
  },
  {
    id: "finance",
    label: "Finance & sales",
    title: "Get paid with less follow-up",
    body: "Public pay links and bank details on the invoice make it obvious how clients should pay.",
  },
];

export function RolesSection() {
  const [active, setActive] = useState(roles[0].id);
  const reduceMotion = useReducedMotion();
  const current = roles.find((role) => role.id === active) ?? roles[0];

  return (
    <MotionSection className="border-t border-[#E5E7EB] bg-[#F9FAFB] py-20 sm:py-24">
      <div className="bonsai-container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="bonsai-h2">A platform built for everyone on the team</h2>
          <p className="bonsai-lead mt-4">
            With tailored views for every role, SterlingSend keeps collaboration smooth
            from first draft to paid invoice.
          </p>
          <Link
            href={routes.createInvoice}
            className="bonsai-btn-primary mt-8 inline-flex"
          >
            Try SterlingSend for free
          </Link>
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              className={cn(
                "bonsai-pill",
                active === role.id && "bonsai-pill--active",
              )}
              onClick={() => setActive(role.id)}
            >
              {role.label}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-[#E5E7EB] bg-white p-8 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            >
              <h3 className="bonsai-h3 text-xl">{current.title}</h3>
              <p className="bonsai-lead mt-3">{current.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MotionSection>
  );
}
