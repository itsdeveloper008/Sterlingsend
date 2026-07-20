"use client";

import { MotionSection } from "@/features/marketing/lib/motion-section";

const logos = [
  "Bright Studio",
  "Oakfield",
  "Meridian Co",
  "Cedar Labs",
  "Northwind",
  "Harbor Digital",
];

export function SocialProofStrip() {
  return (
    <MotionSection className="border-y border-[#E5E7EB] bg-white py-12 sm:py-14">
      <div className="bonsai-container text-center">
        <p className="text-sm font-medium text-[#6B7280]">
          Join freelancers and firms using SterlingSend to streamline invoicing.
        </p>
        <div className="bonsai-logo-row mt-8">
          {logos.map((name) => (
            <span key={name} className="bonsai-logo-mark">
              {name}
            </span>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}
