"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { routes } from "@/config/routes";
import { MotionReveal } from "@/features/marketing/lib/motion-reveal";
import { MotionSection } from "@/features/marketing/lib/motion-section";

const quotes = [
  {
    body: "I can create a clean invoice in minutes and send it to clients without juggling spreadsheets.",
    name: "Alex",
    role: "Freelance designer",
  },
  {
    body: "Guest Mode meant I tried SterlingSend before signing up - the PDF looked professional straight away.",
    name: "Priya",
    role: "Consultant",
  },
  {
    body: "Tracking what’s paid vs overdue used to take forever. Now it’s one dashboard glance.",
    name: "Jordan",
    role: "Agency owner",
  },
  {
    body: "Clients pay via the public link with Stripe. I don’t chase bank transfers as often.",
    name: "Sam",
    role: "Developer",
  },
  {
    body: "Saved services and customers make repeat invoices almost automatic.",
    name: "Morgan",
    role: "Studio lead",
  },
  {
    body: "We wanted something simple for UK VAT invoices - SterlingSend stays focused on that.",
    name: "Casey",
    role: "Operations",
  },
];

export function TestimonialsSection() {
  return (
    <MotionSection className="py-20 sm:py-24">
      <div className="bonsai-container">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <h2 className="bonsai-h2">See why customers love using SterlingSend</h2>
            <p className="bonsai-lead mt-4">
              Simple invoicing that feels modern - without the all-in-one bloat.
            </p>
          </div>
          <Link href={routes.createInvoice} className="bonsai-btn-primary shrink-0">
            Try SterlingSend for free
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quotes.map((quote, index) => (
            <MotionReveal key={quote.name} delay={index * 0.05}>
              <figure className="bonsai-quote">
                <div className="bonsai-stars" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-[#374151]">
                  “{quote.body}”
                </blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold text-[#111827]">{quote.name}</span>
                  <span className="text-[#6B7280]">, {quote.role}</span>
                </figcaption>
              </figure>
            </MotionReveal>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}
