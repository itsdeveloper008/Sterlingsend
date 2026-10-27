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
    <section
      className="ss-section bg-white px-4 sm:px-6"
      style={{ borderBottom: "1px solid var(--border-decorative)" }}
    >
      <div className="bonsai-container">
        <MotionReveal>
          <p className="ss-eyebrow">PDF toolkit</p>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="type-h2">Popular PDF tools</h2>
              <p className="ss-measure mt-6 text-[17px] leading-[1.7] text-[var(--secondary-text)]">
                Eight tools people use most. Open any tool and run it in your
                browser.
              </p>
            </div>
            <Link href={routes.tools} className="bonsai-btn-secondary">
              See all {toolCount} tools
            </Link>
          </div>
        </MotionReveal>
        <ul
          className="mt-10 grid grid-cols-2 md:grid-cols-4"
          style={{ gap: "28px" }}
        >
          {tools.map((tool, index) => {
            if (!tool) return null;
            const Icon = tool.Icon;
            const tile = (
              <Link
                href={routes.tool(tool.slug)}
                className="ss-card-lift glass group flex h-full flex-col gap-4 rounded-2xl p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-700)]"
              >
                <span className="clay flex h-[52px] w-[52px] items-center justify-center text-[var(--brand-700)]">
                  <Icon className="h-5 w-5" aria-hidden strokeWidth={1.5} />
                </span>
                <span className="text-lg font-semibold text-[var(--ink)]">
                  {tool.title}
                </span>
                <span className="line-clamp-2 text-[15px] leading-snug text-[var(--secondary-text)]">
                  {tool.description}
                </span>
              </Link>
            );
            return (
              <li key={tool.slug}>
                {index < 6 ? (
                  <MotionReveal delayMs={index * 80}>{tile}</MotionReveal>
                ) : (
                  tile
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
