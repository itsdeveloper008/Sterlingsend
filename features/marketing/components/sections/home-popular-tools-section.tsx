"use client";

import Link from "next/link";
import {
  Combine,
  Scissors,
  Minimize2,
  FileImage,
  ImagePlus,
  FileType,
  Pencil,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import { routes } from "@/config/routes";
import { PDF_TOOLS } from "@/features/pdf-tools/catalog";
import { MotionReveal } from "@/features/marketing/lib/motion-reveal";

const POPULAR_SLUGS = [
  "merge-pdf",
  "split-pdf",
  "compress-pdf",
  "pdf-to-jpg",
  "jpg-to-pdf",
  "word-to-pdf",
  "edit-pdf",
  "sign-pdf",
] as const;

const ICONS: Record<(typeof POPULAR_SLUGS)[number], LucideIcon> = {
  "merge-pdf": Combine,
  "split-pdf": Scissors,
  "compress-pdf": Minimize2,
  "pdf-to-jpg": FileImage,
  "jpg-to-pdf": ImagePlus,
  "word-to-pdf": FileType,
  "edit-pdf": Pencil,
  "sign-pdf": PenLine,
};

export function HomePopularToolsSection() {
  const toolCount = PDF_TOOLS.length;
  const tools = POPULAR_SLUGS.map((slug) => {
    const tool = PDF_TOOLS.find((t) => t.slug === slug);
    if (!tool) return null;
    return { ...tool, Icon: ICONS[slug] };
  }).filter(Boolean);

  return (
    <section className="ss-section border-b border-border-subtle bg-[var(--surface-muted)]">
      <div className="bonsai-container">
        <MotionReveal>
          <h2 className="bonsai-h2">Popular PDF tools</h2>
          <p className="marketing-body mt-3 max-w-2xl">
            Eight tools people use most. Open any tool and run it in your
            browser.
          </p>
        </MotionReveal>
        <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {tools.map((tool, index) => {
            if (!tool) return null;
            const Icon = tool.Icon;
            const tile = (
              <Link
                href={routes.tool(tool.slug)}
                data-ss-tilt="card"
                className="ss-card-lift ss-card-tilt ss-card-spotlight group flex h-full flex-col gap-3 rounded-2xl border border-border-subtle bg-card p-6 shadow-[var(--shadow-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-500)]"
              >
                <span className="clay ss-icon-tilt flex h-12 w-12 items-center justify-center text-[var(--brand-700)]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-lg font-semibold text-[var(--ink)]">
                  {tool.title}
                </span>
                <span className="line-clamp-2 text-[0.9375rem] leading-snug text-[var(--body-text)]">
                  {tool.description}
                </span>
              </Link>
            );
            return (
              <li key={tool.slug}>
                {index < 6 ? (
                  <MotionReveal delayMs={index * 60}>{tile}</MotionReveal>
                ) : (
                  tile
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-10">
          <Link href={routes.tools} className="bonsai-btn-secondary bonsai-btn-secondary--sm">
            See all {toolCount} tools
          </Link>
        </div>
      </div>
    </section>
  );
}
