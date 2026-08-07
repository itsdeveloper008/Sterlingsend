"use client";

import Link from "next/link";
import {
  Combine,
  Crop,
  FileStack,
  Image,
  Lock,
  Minimize2,
  RotateCw,
  Scissors,
  Stamp,
  Unlock,
} from "lucide-react";
import { routes } from "@/config/routes";
import { MotionReveal } from "@/features/marketing/lib/motion-reveal";
import { MotionSection } from "@/features/marketing/lib/motion-section";

const categories = [
  {
    title: "Optimize",
    description: "Compress PDFs and prepare files for sharing.",
    tools: ["Compress PDF", "Repair PDF", "OCR PDF"],
  },
  {
    title: "Convert",
    description: "Move between PDF, images, and office formats.",
    tools: ["JPG ↔ PDF", "PDF to Word", "PDF to Markdown"],
  },
  {
    title: "Organize",
    description: "Merge, split, extract, and reorder pages.",
    tools: ["Merge", "Split", "Organize pages"],
  },
  {
    title: "Edit",
    description: "Rotate, crop, number pages, and watermark.",
    tools: ["Rotate", "Watermark", "Page numbers"],
  },
  {
    title: "Security",
    description: "Protect, unlock, redact, sign, and compare.",
    tools: ["Protect", "Unlock", "Redact"],
  },
];

const readyIcons = [
  { icon: Minimize2, label: "Compress" },
  { icon: Combine, label: "Merge" },
  { icon: Scissors, label: "Split" },
  { icon: RotateCw, label: "Rotate" },
  { icon: Lock, label: "Protect" },
  { icon: Unlock, label: "Unlock" },
  { icon: Stamp, label: "Watermark" },
  { icon: Crop, label: "Crop" },
  { icon: Image, label: "JPG ↔ PDF" },
];

export function PdfToolsPromoSection() {
  return (
    <MotionSection className="py-20 sm:py-24">
      <div className="bonsai-container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="bonsai-eyebrow inline-flex items-center gap-2">
            <FileStack className="h-3.5 w-3.5" aria-hidden />
            PDF Toolkit
          </p>
          <h2 className="bonsai-h2 mt-3">
            Every PDF tool you need, free to use
          </h2>
          <p className="bonsai-lead mt-4">
            An iLovePDF-style toolkit built into SterlingSend. Convert, OCR,
            sign, organize, and secure documents in your browser, no account
            required.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {readyIcons.map(({ icon: Icon, label }) => (
            <span key={label} className="bonsai-chip pointer-events-none">
              <Icon className="mr-1.5 inline h-3.5 w-3.5 text-teal-600" aria-hidden />
              {label}
            </span>
          ))}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((cat, index) => (
            <MotionReveal key={cat.title} delay={index * 0.05}>
              <article className="bonsai-pillar">
                <h3 className="bonsai-h3 text-base">{cat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                  {cat.description}
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-[#475569]">
                  {cat.tools.map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                      {t}
                    </li>
                  ))}
                </ul>
              </article>
            </MotionReveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href={routes.tools} className="bonsai-btn-primary">
            Open PDF Tools
          </Link>
          <p className="mt-3 text-xs text-[#94A3B8]">
            Free forever for guest use. Log in only if you want to save invoices
            and client details.
          </p>
        </div>
      </div>
    </MotionSection>
  );
}
