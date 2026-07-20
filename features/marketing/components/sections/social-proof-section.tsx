"use client";

import { MotionSection } from "@/features/marketing/lib/motion-section";

const industries = ["Freelancers", "Consultants", "Agencies", "Trades", "Studios"];

const stats = [
  { value: "2 min", label: "Average time to first invoice" },
  { value: "£0", label: "To start with Guest Mode" },
  { value: "UK VAT", label: "Ready out of the box" },
];

export function SocialProofSection() {
  return (
    <MotionSection className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="marketing-small text-center">Built for UK service businesses</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {industries.map((name) => (
            <span key={name} className="marketing-pill">
              {name}
            </span>
          ))}
        </div>

        <dl className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="marketing-stat">{stat.value}</dt>
              <dd className="marketing-small mt-2">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </MotionSection>
  );
}
