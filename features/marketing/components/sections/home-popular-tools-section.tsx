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
    <section className="border-b border-[#E2E8F0] bg-white px-4 py-24 dark:border-[#1E293B] dark:bg-[#0B1220] sm:px-6">
      <div className="bonsai-container">
        <MotionReveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[40px] font-bold leading-tight text-[#0F172A] dark:text-white">
                Popular PDF tools
              </h2>
              <p className="mt-3 max-w-2xl text-base text-[#475569] dark:text-[#CBD5E1]">
                Eight tools people use most. Open any tool and run it in your
                browser.
              </p>
            </div>
            <Link
              href={routes.tools}
              className="inline-flex h-11 items-center justify-center rounded-xl border-[1.5px] border-[#94A3B8] bg-white px-4 text-[15px] font-bold text-[#0F172A] transition-transform hover:-translate-y-0.5 dark:bg-[#13202F] dark:text-white"
            >
              See all {toolCount} tools
            </Link>
          </div>
        </MotionReveal>
        <ul className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {tools.map((tool, index) => {
            if (!tool) return null;
            const Icon = tool.Icon;
            const tile = (
              <Link
                href={routes.tool(tool.slug)}
                data-ss-tilt="card"
                className="ss-card-lift ss-card-tilt ss-card-spotlight group flex h-full flex-col gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14B8A6] dark:border-[#1E293B] dark:bg-[#13202F]"
              >
                <span className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#CCFBF1] text-[#0F766E] shadow-[inset_0_3px_0_#fff,0_8px_16px_rgba(15,23,42,.08)]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-lg font-bold text-[#0F172A] dark:text-white">
                  {tool.title}
                </span>
                <span className="line-clamp-1 text-[15px] leading-snug text-[#475569] dark:text-[#CBD5E1]">
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
      </div>
    </section>
  );
}
