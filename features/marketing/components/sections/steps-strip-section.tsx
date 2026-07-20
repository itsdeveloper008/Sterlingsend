"use client";

import { MotionSection } from "@/features/marketing/lib/motion-section";

const steps = [
  { number: "1", label: "Add details" },
  { number: "2", label: "Preview & download PDF" },
  { number: "3", label: "Send or print" },
];

export function StepsStripSection() {
  return (
    <MotionSection className="border-t border-[#E2E8F0] bg-[#FAFAFA] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ol className="flex list-none flex-col gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-0">
          {steps.map((step, index) => (
            <li
              key={step.number}
              className="flex items-center gap-3 sm:px-6"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#14B8A6]/10 text-sm font-semibold text-[#0D9488]">
                {step.number}
              </span>
              <span className="text-sm font-medium text-[#0F172A]">{step.label}</span>
              {index < steps.length - 1 ? (
                <span
                  className="ml-6 hidden text-[#CBD5E1] sm:inline"
                  aria-hidden
                >
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </MotionSection>
  );
}
